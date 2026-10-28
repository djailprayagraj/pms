import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fetchAdalatByDate, deleteAdalatEntry } from '../../../api/adalatService';
import HistorySectionDeleteModal from './HistorySectionDeleteModal';

// Safe Transliteration with Offline/CORS Fallback
const transliterateToHindi = async (text) => {
  if (!text || typeof text !== 'string') return '';
  if (!/[a-zA-Z]/.test(text) || /[\u0900-\u097F]/.test(text)) return text;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=hi-t-i0-und&num=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    if (data[0] === 'SUCCESS' && data[1]?.[0]?.[1]?.[0]) {
      return data[1][0][1][0];
    }
  } catch (error) {
    console.warn(`[Transliteration Notice] API blocked or offline for: "${text}". Using clean English fallback.`, error);
  }

  return text; 
};

const cleanPurePersonName = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return '';

  let cleaned = rawName
    .replace(/\([^)]*\)/g, '')
    .replace(/[@#\/]/g, ' ')
    .replace(/\b(ut|fir)\b/gi, '')
    .replace(/[0-9]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || rawName;
};

const smartTransliterateMixedString = async (rawText) => {
  if (!rawText || typeof rawText !== 'string' || rawText.trim() === '' || rawText.toUpperCase() === 'NA') {
    return 'N/A';
  }

  const pureName = cleanPurePersonName(rawText);
  const translatedName = await transliterateToHindi(pureName);

  return translatedName.trim() || 'N/A';
};

const HistorySection = ({ isOpen: externalIsOpen, onClose: externalOnClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = externalOnClose || (() => setInternalIsOpen(false));
  const handleToggle = () => {
    if (externalIsOpen !== undefined) {
      if (isOpen && externalOnClose) externalOnClose();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  // --- Local State (No Redux) ---
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dbRecords, setDbRecords] = useState([]);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'session', 'vc'
  const [genderFilter, setGenderFilter] = useState('all'); // 'all', 'male', 'female'
  const [isTranslating, setIsTranslating] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [feedMessage, setFeedMessage] = useState(null);

  // --- Modal State for Deletion Confirmation ---
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    record: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Fetch Records Directly From Backend API ---
  const fetchDbRecords = useCallback(async () => {
    try {
      setIsLoadingDb(true);
      const response = await fetchAdalatByDate(selectedDate);
      
      const rawData = Array.isArray(response) 
        ? response 
        : (response?.data && Array.isArray(response.data) ? response.data : response?.entries || []);

      const formattedRecords = rawData.map((item) => ({
        id: item._id || item.id,
        ut_code: item.utNumber || item.ut_code || 'N/A',
        full_name: item.prisonerName || item.full_name || 'N/A',
        father_name: item.fatherName || item.father_name || 'N/A',
        barrack: item.barrack || '6-B',
        fir_number: item.firNumber || item.fir_number || 'N/A',
        legal_provision: item.warrantType || item.actSection || '167/187',
        action_category: item.actionCategory || 'Jail Adalat',
        sub_option: item.appearanceMode === 'VC' ? 'vc' : 'adalat',
        gender: item.gender ? item.gender.toLowerCase() : 'male', // Normalized gender field
        hearing_date: item.hearingDate ? item.hearingDate.split('T')[0] : selectedDate,
        court_name: item.courtName || 'District Court',
        district: item.district || 'Prayagraj',
        is_riha: item.custodyStatus === 'RIHA',
        created_at: item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
      }));

      setDbRecords(formattedRecords);
    } catch (error) {
      console.error('Failed to fetch entries directly from database:', error);
      setFeedMessage({ type: 'error', text: '❌ Failed to load records from database.' });
    } finally {
      setIsLoadingDb(false);
    }
  }, [selectedDate]);

  // Fetch when drawer opens or selectedDate changes
  useEffect(() => {
    if (isOpen) {
      fetchDbRecords();
    }
  }, [isOpen, selectedDate, fetchDbRecords]);

  // --- Filtered Records Calculation (Category + Gender) ---
  const filteredRecords = React.useMemo(() => {
    return dbRecords.filter((r) => {
      // Category Filter
      const matchesCategory = 
        filterMode === 'all' ? true :
        filterMode === 'vc' ? r.sub_option === 'vc' :
        filterMode === 'session' ? r.sub_option !== 'vc' : true;

      // Gender Filter
      const matchesGender = 
        genderFilter === 'all' ? true :
        genderFilter === 'male' ? (r.gender === 'male' || r.gender === 'm') :
        genderFilter === 'female' ? (r.gender === 'female' || r.gender === 'f') : true;

      return matchesCategory && matchesGender;
    });
  }, [dbRecords, filterMode, genderFilter]);

  // --- Draggable Button State & Logic ---
  const [position, setPosition] = useState({ x: window.innerWidth - 140, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; 
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      const newX = Math.max(10, Math.min(window.innerWidth - 80, dragRef.current.initialX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 60, dragRef.current.initialY + dy));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // --- Confirm and Execute Database Delete via API ---
  const handleConfirmDelete = async () => {
    const record = deleteModal.record;
    if (!record || !record.id) return;

    try {
      setIsDeleting(true);
      await deleteAdalatEntry(record.id);
      
      setDbRecords((prev) => prev.filter((item) => item.id !== record.id));
      setFeedMessage({ type: 'success', text: '🗑️ Entry successfully deleted from database.' });
    } catch (error) {
      console.error('Failed to delete entry from database:', error);
      setFeedMessage({ type: 'error', text: '❌ Failed to delete entry from database.' });
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, record: null });
    }
  };

  // --- Open Full-Page Pure White Print Preview Tab (Using filteredRecords) ---
  const handleOpenPrintPreviewTab = async () => {
    if (filteredRecords.length === 0) {
      alert("मुद्रण के लिए कोई रिकॉर्ड उपलब्ध नहीं है।");
      return;
    }

    setIsTranslating(true);

    try {
      const BATCH_SIZE = 20;
      const translatedRecords = [];

      for (let i = 0; i < filteredRecords.length; i += BATCH_SIZE) {
        const batch = filteredRecords.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (record) => ({
            ...record,
            full_name_hi: await smartTransliterateMixedString(record.full_name),
            father_name_hi: await smartTransliterateMixedString(record.father_name),
          }))
        );
        translatedRecords.push(...batchResults);
      }

      const midPoint = Math.ceil(translatedRecords.length / 2);
      const leftRecords = translatedRecords.slice(0, midPoint);
      const rightRecords = translatedRecords.slice(midPoint);
      const peshiDate = filteredRecords[0]?.hearing_date || selectedDate;
      const subtitleText = filterMode === 'vc' ? 'VC LIST' : filterMode === 'session' ? 'SESSION ADALAT LIST' : 'ADALAT PESHI LIST';

      const renderTableRows = (records, startIndex) => {
        return records
          .map((record, idx) => {
            const actualIndex = startIndex + idx;
            return `
              <tr class="even:bg-gray-50 border-b border-gray-400">
                <td class="border border-gray-800 px-[1px] py-[0px] text-center font-bold english-num w-5 text-[8px] leading-tight"><span>${actualIndex + 1}</span></td>
                <td class="border border-gray-800 px-[1px] py-[0px] font-semibold english-num w-10 text-[8px] leading-tight"><span>${record.ut_code || 'N/A'}</span></td>
                <td class="border border-gray-800 px-[2px] py-[0px] font-bold text-[8px] leading-tight"><span class="english-num">${record.full_name_hi}</span></td>
                <td class="border border-gray-800 px-[2px] py-[0px] text-[8px] leading-tight"><span class="english-num">${record.father_name_hi}</span></td>
                <td class="border border-gray-800 px-[1px] py-[0px] text-center font-semibold english-num w-6 text-[8px] leading-tight"><span>${record.barrack || 'N/A'}</span></td>
                <td class="border border-gray-800 px-[1px] py-[0px] text-center font-bold english-num w-10 text-[8px] leading-tight"><span>${record.legal_provision || '167/187'}</span></td>
                <td class="border border-gray-800 px-[1px] py-[0px] english-num w-11 text-[8px] leading-tight"><span>${record.fir_number || 'N/A'}</span></td>
              </tr>
            `;
          })
          .join('');
      };

      const previewHtml = `
        <!DOCTYPE html>
        <html lang="hi">
          <head>
            <meta charset="UTF-8" />
            <title>अदालत पेशी सूची - ${peshiDate}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Tiro Devanagari Hindi', 'Noto Sans Devanagari', sans-serif;
                background-color: #ffffff !important;
                margin: 0;
                padding: 12px;
              }
              .english-num {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace !important;
                font-variant-numeric: latin !important;
              }
              @media print {
                body { padding: 0 !important; margin: 0 !important; background-color: #ffffff !important; font-size: 8px; }
                @page { size: A4 portrait; margin: 3mm; }
                tr { page-break-inside: avoid; }
                .signature-block { page-break-inside: avoid; margin-top: 8px !important; }
                .print-container { width: 100% !important; max-width: 100% !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
                .print-grid { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 4px !important; align-items: start !important; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body class="text-black min-h-screen bg-white">
            <div class="no-print w-full mb-4 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl flex justify-between items-center text-white">
              <div>
                <h3 class="text-xs font-bold font-mono">👁️ Full-Page Print Preview Mode (${subtitleText})</h3>
                <p class="text-[10px] text-slate-400 font-mono">White background layout covering entire page width</p>
              </div>
              <div class="flex items-center gap-3">
                <button 
                  onclick="window.print()" 
                  class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>🖨️</span> Print Document
                </button>
                <button 
                  onclick="window.close()" 
                  class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Close Tab
                </button>
              </div>
            </div>

            <div class="print-container w-full bg-white p-2">
              <div class="text-center border-b border-black pb-1 mb-1">
                <h1 class="text-xs font-black uppercase tracking-wider leading-tight">जिला कारागार प्रबंधन प्रणाली</h1>
                <h2 class="text-[10px] font-extrabold text-gray-900 mt-0.5 uppercase tracking-wide">
                  ${subtitleText} FOR <span class="english-num">${peshiDate}</span>
                </h2>
                <div class="flex justify-between items-center mt-0.5 text-[8px] font-semibold text-gray-700 border-t border-gray-200 pt-0.5">
                  <span>कुल बंदी संख्या: <strong class="text-black english-num">${translatedRecords.length}</strong></span>
                  <span>दिनांक: <strong class="text-black english-num">${peshiDate}</strong></span>
                </div>
              </div>

              <div class="print-grid grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
                <table class="w-full border-collapse border border-gray-800 text-[8px] text-left">
                  <thead>
                    <tr class="bg-gray-200 border-b border-gray-800 text-black font-bold text-[7px] uppercase">
                      <th class="border border-gray-800 px-[1px] py-[0px] text-center w-5">S.No</th>
                      <th class="border border-gray-800 px-[1px] py-[0px] w-10">यू.टी. नं.</th>
                      <th class="border border-gray-800 px-[2px] py-[0px]">बंदी का नाम</th>
                      <th class="border border-gray-800 px-[2px] py-[0px]">पिता का नाम</th>
                      <th class="border border-gray-800 px-[1px] py-[0px] text-center w-6">बैरक</th>
                      <th class="border border-gray-800 px-[1px] py-[0px] text-center w-10">वारंट टाइप</th>
                      <th class="border border-gray-800 px-[1px] py-[0px] w-11">एफ.आई.आर. नं.</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${renderTableRows(leftRecords, 0)}
                  </tbody>
                </table>

                <table class="w-full border-collapse border border-gray-800 text-[8px] text-left">
                  <thead>
                    <tr class="bg-gray-200 border-b border-gray-800 text-black font-bold text-[7px] uppercase">
                      <th class="border border-gray-800 px-[1px] py-[0px] text-center w-5">S.No</th>
                      <th class="border border-gray-800 px-[1px] py-[0px] w-10">यू.टी. नं.</th>
                      <th class="border border-gray-800 px-[2px] py-[0px]">बंदी का नाम</th>
                      <th class="border border-gray-800 px-[2px] py-[0px]">पिता का नाम</th>
                      <th class="border border-gray-800 px-[1px] py-[0px] text-center w-6">बैरक</th>
                      <th class="border border-gray-800 px-[1px] py-[0px] text-center w-10">वारंट टाइप</th>
                      <th class="border border-gray-800 px-[1px] py-[0px] w-11">एफ.आई.आर. नं.</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${renderTableRows(rightRecords, leftRecords.length)}
                  </tbody>
                </table>
              </div>

              <div class="signature-block mt-3 flex justify-end items-end text-[9px] font-bold pt-1">
                <div class="text-center">
                  <div class="border-t border-black w-28 mb-0.5"></div>
                  <p>(हवालात प्रभारी)</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.document.open();
        newTab.document.write(previewHtml);
        newTab.document.close();
      } else {
        alert("Pop-up blocker prevented opening the preview tab. Please allow pop-ups for this site.");
      }

    } catch (err) {
      console.error("Error opening print preview tab:", err);
      alert("Error processing preview. Please check console logs.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <>
      {externalIsOpen === undefined && (
        <button
          type="button"
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            if (Math.abs(e.clientX - dragRef.current.startX) < 5) {
              handleToggle();
            }
          }}
          title="Click and hold to drag, click to toggle drawer"
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
          className={`fixed z-50 flex items-center gap-2 bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md transition-shadow cursor-grab active:cursor-grabbing group select-none`}
        >
          <svg
            className={`w-3 h-3 text-emerald-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : 'group-hover:-translate-x-0.5'
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-mono font-medium tracking-wide text-slate-300 group-hover:text-white pointer-events-none">
            Database Log ({dbRecords.length})
          </span>
        </button>
      )}

      {isOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[85vw] bg-slate-900/95 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">📜</span>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Database Synced Records {isLoadingDb && '(Loading DB...)'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Fetched live from database via backend API
              </p>
            </div>

            {/* Local Date Picker to fetch records by date */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
              <span className="text-[11px] text-slate-400">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-emerald-400 font-mono text-xs focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={fetchDbRecords}
              disabled={isLoadingDb}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow cursor-pointer transition flex items-center gap-1.5"
              title="Refresh database records"
            >
              <span>🔄</span>
              <span>{isLoadingDb ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPrintPreviewTab}
              disabled={isTranslating || filteredRecords.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg border border-indigo-500/40 shadow cursor-pointer transition flex items-center gap-1.5"
              title="Open full-page white print preview in a new tab"
            >
              <span>🖨️</span>
              <span>{isTranslating ? 'हिंदी रूपांतरण जारी...' : `Print Hindi Log (${filteredRecords.length})`}</span>
            </button>

            <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg font-mono text-slate-300">
              Total: {dbRecords.length}
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {feedMessage && (
          <div className={`px-4 py-2 text-xs font-mono font-bold flex items-center justify-between border-b ${
            feedMessage.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-red-950/80 text-red-300 border-red-800'
          }`}>
            <span>{feedMessage.text}</span>
            <button onClick={() => setFeedMessage(null)} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">✕</button>
          </div>
        )}

        {/* Filter Bar (Category & Gender Filters) */}
        <div className="px-4 py-2.5 bg-slate-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          
          {/* Left: Category Filters */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 mr-1">Type:</span>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-slate-800 border-slate-700 text-white font-bold'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({dbRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('session')}
              className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                filterMode === 'session'
                  ? 'bg-amber-950/80 border-amber-800 text-amber-300 font-bold'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Session Adalat ({dbRecords.filter((r) => r.sub_option !== 'vc').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('vc')}
              className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                filterMode === 'vc'
                  ? 'bg-indigo-950/80 border-indigo-800 text-indigo-300 font-bold'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              VC ({dbRecords.filter((r) => r.sub_option === 'vc').length})
            </button>
          </div>

          {/* Right: Gender Filters */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 mr-1">Gender:</span>
            <button
              type="button"
              onClick={() => setGenderFilter('all')}
              className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                genderFilter === 'all'
                  ? 'bg-slate-800 border-slate-700 text-white font-bold'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Genders
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('male')}
              className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                genderFilter === 'male'
                  ? 'bg-blue-950/80 border-blue-800 text-blue-300 font-bold'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              👨 Male ({dbRecords.filter((r) => r.gender === 'male' || r.gender === 'm').length})
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('female')}
              className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                genderFilter === 'female'
                  ? 'bg-pink-950/80 border-pink-800 text-pink-300 font-bold'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              👩 Female ({dbRecords.filter((r) => r.gender === 'female' || r.gender === 'f').length})
            </button>
          </div>

        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
                    <th className="p-3 text-center w-12">S.No</th>
                    <th className="p-3">UT Code</th>
                    <th className="p-3">Prisoner Name</th>
                    <th className="p-3">FIR No.</th>
                    <th className="p-3">Warrant Type</th>
                    <th className="p-3">Category & Option</th>
                    <th className="p-3">Execution Date</th>
                    <th className="p-3">Status / Time</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-slate-500 italic">
                        {isLoadingDb ? 'Loading records from database...' : `No records found for the selected filters on date: ${selectedDate}.`}
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record, index) => {
                      return (
                        <tr
                          key={record.id || index}
                          className="transition hover:bg-slate-800/40"
                        >
                          <td className="p-3 text-center font-bold text-slate-400">
                            {index + 1}
                          </td>
                          <td className="p-3 text-red-400 font-bold">{record.ut_code}</td>
                          <td className="p-3 text-white font-sans font-semibold">
                            {record.full_name}
                          </td>
                          <td className="p-3 text-slate-300">{record.fir_number}</td>
                          <td className="p-3 text-amber-400 font-bold">{record.legal_provision || '167/187'}</td>
                          <td className="p-3 text-slate-300 uppercase text-[10px]">
                            <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-amber-400 font-bold">
                              {record.action_category} ({record.sub_option})
                            </span>
                          </td>
                          <td className="p-3 text-emerald-400">{record.hearing_date}</td>
                          <td className="p-3 text-slate-400 text-[11px] font-sans flex items-center gap-2">
                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                              ✓ SAVED IN DB
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {record.created_at}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ isOpen: true, record })}
                              className="bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white p-1.5 rounded-lg transition cursor-pointer shadow flex items-center justify-center mx-auto"
                              title="Delete entry from database"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Imported Delete Confirmation Modal Component */}
      <HistorySectionDeleteModal
        isOpen={deleteModal.isOpen}
        record={deleteModal.record}
        isDeleting={isDeleting}
        onClose={() => setDeleteModal({ isOpen: false, record: null })}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default HistorySection;