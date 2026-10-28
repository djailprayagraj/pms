import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchAdalatByDate } from '../../../api/adalatService';

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

// Helper function to detect female inmates
const isFemaleInmate = (record) => {
  if (!record) return false;
  
  if (record.gender && record.gender.toUpperCase() === 'FEMALE') return true;
  if (record.sex && record.sex.toUpperCase() === 'FEMALE') return true;

  const name = (record.prisonerName || '').toLowerCase();
  const barrack = (record.barrack || '').toLowerCase();

  if (barrack.includes('female') || barrack.includes('mahila') || barrack.includes('women')) {
    return true;
  }

  const femaleKeywords = [
    'devi', 'kumari', 'w/o', 'wife of', 'd/o', 'daughter of', 
    'sita', 'geeta', 'sunita', 'anita', 'pooja', 'rekha', 'radha', 'usha', 'asha'
  ];

  return femaleKeywords.some(keyword => name.includes(keyword));
};

// Helper to filter based on selected mode ('ALL' | 'SESSION' | 'VC')
const filterRecordsByMode = (recordsList, filterMode) => {
  if (!Array.isArray(recordsList)) return [];
  
  return recordsList.filter((record) => {
    const mode = (record.appearanceMode || '').toUpperCase();
    const option = (record.sub_option || '').toUpperCase();
    const isVC = mode === 'VC' || option === 'VC';
    const isSession = mode === 'SESSION_ADALAT' || mode === 'ADALAT';

    if (filterMode === 'SESSION') {
      return isSession && !isVC;
    }
    if (filterMode === 'VC') {
      return isVC;
    }
    return true;
  });
};

// Helper to extract UNIQUE PRISONERS by utNumber
const deduplicateRecordsByUT = (recordsList) => {
  if (!Array.isArray(recordsList)) return [];
  const seenUTs = new Set();
  const uniqueList = [];

  for (const record of recordsList) {
    const utKey = (record.utNumber || '').trim().toUpperCase();
    if (utKey && !seenUTs.has(utKey)) {
      seenUTs.add(utKey);
      uniqueList.push(record);
    } else if (!utKey) {
      uniqueList.push(record);
    }
  }

  return uniqueList;
};

// Custom sorter: puts female inmates at the very end
const sortRecordsWithFemalesLast = (recordsList) => {
  if (!Array.isArray(recordsList)) return [];

  const males = [];
  const females = [];

  recordsList.forEach((record) => {
    if (isFemaleInmate(record)) {
      females.push(record);
    } else {
      males.push(record);
    }
  });

  return [...males, ...females];
};

const WarrantWiseListAdalat = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [appearanceFilter, setAppearanceFilter] = useState('SESSION');

  const [loading, setLoading] = useState(false);
  const [rawRecords, setRawRecords] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch logs across date range and attach fetch date to each record if missing
  const fetchWarrantLogsRange = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const start = new Date(fromDate);
      const end = new Date(toDate);

      if (start > end) {
        setErrorMessage('From Date cannot be later than To Date.');
        setLoading(false);
        return;
      }

      let aggregatedRecords = [];
      let currentDate = new Date(start);

      while (currentDate <= end) {
        const dateString = currentDate.toISOString().split('T')[0];
        try {
          const response = await fetchAdalatByDate(dateString);
          const data = response.data || response;
          if (Array.isArray(data)) {
            const stampedData = data.map(item => ({
              ...item,
              hearingDate: item.hearingDate ? item.hearingDate.split('T')[0] : dateString
            }));
            aggregatedRecords = [...aggregatedRecords, ...stampedData];
          }
        } catch (dayErr) {
          console.warn(`Failed to fetch records for ${dateString}`, dayErr);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const uniqueRecords = deduplicateRecordsByUT(aggregatedRecords);
      setRawRecords(uniqueRecords);
    } catch (error) {
      console.error('Error fetching warrant-wise logs by date range:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to fetch logs from server.');
      setRawRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarrantLogsRange();
  }, []);

  const filteredRecords = filterRecordsByMode(rawRecords, appearanceFilter);

  const warrantGroups = {
    '167/187': sortRecordsWithFemalesLast(filteredRecords.filter((item) => (item.warrantType || '167/187') === '167/187')),
    '209/232': sortRecordsWithFemalesLast(filteredRecords.filter((item) => item.warrantType === '209/232')),
    '309/346': sortRecordsWithFemalesLast(filteredRecords.filter((item) => item.warrantType === '309/346')),
  };

  // Comprehensive Print Preview
  const handleOpenPrintPreview = async () => {
    if (filteredRecords.length === 0) {
      alert("मुद्रण के लिए कोई रिकॉर्ड उपलब्ध नहीं है।");
      return;
    }

    setIsTranslating(true);

    try {
      const BATCH_SIZE = 20;
      const translatedMap = new Map();

      for (let i = 0; i < filteredRecords.length; i += BATCH_SIZE) {
        const batch = filteredRecords.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (record) => {
            const key = record._id || record.utNumber;
            const prisonerNameHi = await smartTransliterateMixedString(record.prisonerName);
            const fatherNameHi = await smartTransliterateMixedString(record.fatherName);
            translatedMap.set(key, { ...record, prisonerNameHi, fatherNameHi });
          })
        );
      }

      const renderTableRows = (items, startIndex) => {
        if (!items || items.length === 0) {
          return `<tr><td colspan="7" class="border border-gray-800 text-center py-1 text-[10px] italic">कोई रिकॉर्ड नहीं</td></tr>`;
        }
        return items
          .map((record, idx) => {
            const key = record._id || record.utNumber;
            const translated = translatedMap.get(key) || record;
            const isFemale = isFemaleInmate(record);
            return `
              <tr class="even:bg-gray-50 border-b border-gray-400 ${isFemale ? 'bg-pink-50/40' : ''}">
                <td class="border border-gray-800 px-0.5 py-0.5 text-center font-bold english-num w-6 text-[10px] leading-tight"><span>${startIndex + idx + 1}</span></td>
                <td class="border border-gray-800 px-1 py-0.5 font-semibold english-num w-12 text-[10px] leading-tight"><span>${translated.utNumber || 'N/A'}</span></td>
                <td class="border border-gray-800 px-1.5 py-0.5 font-bold text-[11px] leading-tight"><span class="english-num">${translated.prisonerNameHi}</span></td>
                <td class="border border-gray-800 px-1.5 py-0.5 text-[11px] leading-tight"><span class="english-num">${translated.fatherNameHi}</span></td>
                <td class="border border-gray-800 px-0.5 py-0.5 text-center font-semibold english-num w-10 text-[10px] leading-tight"><span>${translated.barrack || 'N/A'}</span></td>
                <td class="border border-gray-800 px-0.5 py-0.5 text-center font-bold english-num w-12 text-[10px] leading-tight"><span>${translated.warrantType || '167/187'}</span></td>
                <td class="border border-gray-800 px-1 py-0.5 english-num w-14 text-[10px] leading-tight"><span>${translated.firNumber || 'N/A'}</span></td>
              </tr>
            `;
          })
          .join('');
      };

      const renderWarrantSectionHtml = (title, items) => {
        const sortedItems = sortRecordsWithFemalesLast(items);
        const displayDate = fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`;
        return `
          <div class="mb-4 page-break-inside-avoid">
            <div class="flex justify-between items-center bg-gray-200 border border-gray-800 px-2 py-0.5 mb-1 uppercase text-[10px] font-bold">
              <span>Warrant Type: ${title} (${sortedItems.length} Inmates)</span>
              <span class="english-num">Date: ${displayDate}</span>
            </div>
            <table class="w-full border-collapse border border-gray-800 text-[10px] text-left">
              <thead>
                <tr class="bg-gray-100 border-b border-gray-800 text-black font-bold text-[10px] uppercase">
                  <th class="border border-gray-800 px-0.5 py-0.5 text-center w-6">S.No</th>
                  <th class="border border-gray-800 px-1 py-0.5 w-12">यू.टी. नं.</th>
                  <th class="border border-gray-800 px-1.5 py-0.5">बंदी का नाम</th>
                  <th class="border border-gray-800 px-1.5 py-0.5">पिता का नाम</th>
                  <th class="border border-gray-800 px-0.5 py-0.5 text-center w-10">बैरक</th>
                  <th class="border border-gray-800 px-0.5 py-0.5 text-center w-12">वारंट टाइप</th>
                  <th class="border border-gray-800 px-1 py-0.5 w-14">एफ.आई.आर. नं.</th>
                </tr>
              </thead>
              <tbody>
                ${renderTableRows(sortedItems, 0)}
              </tbody>
            </table>
          </div>
        `;
      };

      const previewHtml = `
        <!DOCTYPE html>
        <html lang="hi">
          <head>
            <meta charset="UTF-8" />
            <title>अदालत पेशी सूची (${appearanceFilter}) - ${fromDate} से ${toDate}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Tiro Devanagari Hindi', 'Noto Sans Devanagari', sans-serif;
                background-color: #ffffff !important;
                margin: 0;
                padding: 8px;
              }
              .english-num {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace !important;
                font-variant-numeric: latin !important;
              }
              @media print {
                body { padding: 0 !important; margin: 0 !important; background-color: #ffffff !important; font-size: 10px; }
                @page { size: A4 portrait; margin: 6mm 4mm; }
                tr { page-break-inside: avoid; }
                .page-break-inside-avoid { page-break-inside: avoid; }
                .signature-block { page-break-inside: avoid; margin-top: 10px !important; }
                .print-container { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 auto !important; border: none !important; box-shadow: none !important; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body class="text-black min-h-screen bg-white">
            <div class="no-print w-full mb-4 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl flex justify-between items-center text-white">
              <div>
                <h3 class="text-xs font-bold font-mono">👁️ Adalat Range List (${appearanceFilter} - ${filteredRecords.length} Inmates)</h3>
                <p class="text-[10px] text-slate-400 font-mono">From: ${fromDate} To: ${toDate}</p>
              </div>
              <div class="flex items-center gap-3">
                <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow transition cursor-pointer">🖨️ Print Document</button>
                <button onclick="window.close()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-1.5 rounded-lg text-xs transition cursor-pointer">Close Tab</button>
              </div>
            </div>

            <div class="print-container w-full max-w-[202mm] mx-auto bg-white p-0.5">
              <div class="text-center border-b border-black pb-1 mb-2">
                <h1 class="text-sm font-black uppercase tracking-wider leading-tight">जिला कारागार प्रबंधन प्रणाली</h1>
                <h2 class="text-xs font-extrabold text-gray-900 mt-0.5 uppercase tracking-wide">
                  ADALAT PESHI LIST (${appearanceFilter}) - <span class="english-num">${fromDate} से ${toDate}</span>
                </h2>
                <div class="flex justify-between items-center mt-0.5 text-[9px] font-semibold text-gray-700 border-t border-gray-200 pt-0.5">
                  <span>कुल बंदी: <strong class="text-black english-num">${filteredRecords.length}</strong></span>
                  <span>अवधि: <strong class="text-black english-num">${fromDate} से ${toDate}</strong></span>
                </div>
              </div>

              ${renderWarrantSectionHtml('167/187', warrantGroups['167/187'])}
              ${renderWarrantSectionHtml('209/232', warrantGroups['209/232'])}
              ${renderWarrantSectionHtml('309/346', warrantGroups['309/346'])}

              <div class="signature-block mt-4 flex justify-end items-end text-[10px] font-bold pt-2">
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
        alert("Pop-up blocker prevented opening preview.");
      }
    } catch (err) {
      console.error("Preview error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Top Action Header Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400">⚖️</span>
            <h3 className="text-sm font-bold text-white tracking-wide">Warrant-Wise Adalat Records (Date Range)</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Select a date range and filter mode to review consolidated unique inmate appearances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Appearance Mode Filter Tabs */}
          <div className="flex bg-slate-950 border border-slate-700 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setAppearanceFilter('ALL')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                appearanceFilter === 'ALL' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setAppearanceFilter('SESSION')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                appearanceFilter === 'SESSION' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Session
            </button>
            <button
              type="button"
              onClick={() => setAppearanceFilter('VC')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                appearanceFilter === 'VC' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              VC
            </button>
          </div>

          {/* From Date Selector */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg">
            <span className="text-xs text-slate-400 font-mono">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-white text-xs font-mono outline-none cursor-pointer"
            />
          </div>

          {/* To Date Selector */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg">
            <span className="text-xs text-slate-400 font-mono">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-white text-xs font-mono outline-none cursor-pointer"
            />
          </div>

          {/* Fetch Records Button */}
          <button
            type="button"
            onClick={fetchWarrantLogsRange}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 text-white font-semibold text-xs px-4 py-2 rounded-lg border border-emerald-500/40 shadow cursor-pointer transition flex items-center gap-1.5"
          >
            <span>🔍</span>
            <span>{loading ? 'Fetching...' : 'Fetch Records'}</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handleOpenPrintPreview}
            disabled={isTranslating || filteredRecords.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 text-white font-semibold text-xs px-4 py-2 rounded-lg border border-indigo-500/40 shadow cursor-pointer transition flex items-center gap-1.5"
          >
            <span>🖨️</span>
            <span>{isTranslating ? 'रूपांतरण...' : `Print 3 Tables (${filteredRecords.length})`}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="px-4 py-3 bg-red-950 text-red-300 text-xs font-mono border border-red-800 rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* Main Content Area: 3 Separate Tables */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-16 text-center text-slate-500 italic font-mono bg-slate-900/40 border border-slate-800 rounded-xl">
            Fetching records from {fromDate} to {toDate}...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-16 text-center text-slate-500 italic font-mono bg-slate-900/40 border border-slate-800 rounded-xl">
            No records found for the range {fromDate} to {toDate} under filter "{appearanceFilter}".
          </div>
        ) : (
          Object.entries(warrantGroups).map(([warrantType, items]) => {
            const tableDateLabel = fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`;
            return (
              <div key={warrantType} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80 shadow-xl">
                {/* Table Section Header with Date Displayed */}
                <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">📋</span>
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                      Warrant Type: {warrantType} ({appearanceFilter})
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1 rounded">
                      📅 Date: <strong className="text-emerald-400">{tableDateLabel}</strong>
                    </span>
                    <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded text-emerald-400 font-mono font-bold">
                      Total: {items.length}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-950/60 text-slate-300 border-b border-slate-800 font-mono text-xs">
                        <th className="p-3 text-center w-12">S.No</th>
                        <th className="p-3">UT Number</th>
                        <th className="p-3">Prisoner Name</th>
                        <th className="p-3">Father Name</th>
                        <th className="p-3 text-center">Barrack</th>
                        <th className="p-3">FIR No.</th>
                        <th className="p-3">Custody Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-6 text-center text-slate-500 italic">
                            No records for warrant type {warrantType}.
                          </td>
                        </tr>
                      ) : (
                        items.map((record, index) => {
                          const isFemale = isFemaleInmate(record);
                          return (
                            <tr 
                              key={record._id || index} 
                              className={`transition ${isFemale ? 'bg-pink-950/20 border-l-4 border-l-pink-500' : 'hover:bg-slate-800/40'}`}
                            >
                              <td className="p-3 text-center font-bold text-slate-400">{index + 1}</td>
                              <td className="p-3 text-red-400 font-bold">{record.utNumber}</td>
                              <td className="p-3 text-white font-sans font-semibold text-sm flex items-center gap-2">
                                {record.prisonerName}
                                {isFemale && (
                                  <span className="bg-pink-950 text-pink-300 border border-pink-800 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                    ♀ Female
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-slate-300 font-sans text-sm">{record.fatherName}</td>
                              <td className="p-3 text-center text-emerald-400 font-bold">{record.barrack}</td>
                              <td className="p-3 text-slate-300">{record.firNumber}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  record.custodyStatus === 'RIHA' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                }`}>
                                  {record.custodyStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WarrantWiseListAdalat;