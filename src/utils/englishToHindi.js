// Safe Transliteration with Offline/CORS Fallback
export const transliterateToHindi = async (text) => {
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

export const cleanPurePersonName = (rawName) => {
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

export const smartTransliterateMixedString = async (rawText) => {
  if (!rawText || typeof rawText !== 'string' || rawText.trim() === '' || rawText.toUpperCase() === 'NA') {
    return 'N/A';
  }

  const pureName = cleanPurePersonName(rawText);
  const translatedName = await transliterateToHindi(pureName);

  return translatedName.trim() || 'N/A';
};

// --- Open Full-Page Print Preview Tab ---
export const openPrintPreview = async (groupedPrisonerRecords, filterMode, selectedDate) => {
  if (groupedPrisonerRecords.length === 0) {
    alert("मुद्रण के लिए कोई रिकॉर्ड उपलब्ध नहीं है।");
    return;
  }

  try {
    const BATCH_SIZE = 20;
    const translatedRecords = [];

    for (let i = 0; i < groupedPrisonerRecords.length; i += BATCH_SIZE) {
      const batch = groupedPrisonerRecords.slice(i, i + BATCH_SIZE);
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
    const peshiDate = groupedPrisonerRecords[0]?.hearing_date || selectedDate;
    const subtitleText = filterMode === 'vc' ? 'VC LIST' : filterMode === 'session' ? 'SESSION ADALAT LIST' : 'ADALAT PESHI LIST';

    const renderTableRows = (records, startIndex) => {
      return records
        .map((record, idx) => {
          const actualIndex = startIndex + idx;
          const firsString = record.cases.map(c => c.fir_number).join(', ');
          const warrantsString = record.cases.map(c => c.legal_provision).join(', ');
          
          return `
            <tr class="even:bg-gray-50 border-b border-gray-400">
              <td class="border border-gray-800 px-[1px] py-[1px] text-center font-bold english-num w-[3%] text-[8px] leading-tight"><span>${actualIndex + 1}</span></td>
              <td class="border border-gray-800 px-[1px] py-[1px] font-semibold english-num w-[7%] text-[8px] leading-tight truncate"><span>${record.ut_code || 'N/A'}</span></td>
              <!-- Removed truncate, added break-words & whitespace-normal to prevent ... clipping -->
              <td class="border border-gray-800 px-[2px] py-[1px] font-bold adjustable-name w-[24%] break-words whitespace-normal"><span class="english-num">${record.full_name_hi}</span></td>
              <td class="border border-gray-800 px-[2px] py-[1px] adjustable-name w-[24%] break-words whitespace-normal"><span class="english-num">${record.father_name_hi}</span></td>
              <td class="border border-gray-800 px-[1px] py-[1px] text-center font-semibold english-num w-[5%] text-[8px] leading-tight"><span>${record.barrack || 'N/A'}</span></td>
              <td class="border border-gray-800 px-[1px] py-[1px] text-center font-bold english-num w-[18%] text-[7px] leading-tight"><span>${warrantsString || '167/187'}</span></td>
              <td class="border border-gray-800 px-[1px] py-[1px] text-center english-num w-[19%] text-[7px] leading-tight"><span>${firsString || 'N/A'}</span></td>
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
          <title>अदालत पेशी सूची - ${peshiDate || "N/A"}</title>
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
            .adjustable-name {
              font-size: 9px;
              line-height: 1.1;
            }
            @media print {
              body { padding: 0 !important; margin: 0 !important; background-color: #ffffff !important; }
              @page { size: A4 portrait; margin: 3mm; }
              tr { page-break-inside: avoid; }
              .signature-block { page-break-inside: avoid; margin-top: 8px !important; }
              .print-container { width: 100% !important; max-width: 100% !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
              .no-print { display: none !important; }
            }
          </style>
          <!-- Dynamic Print Stylesheet to enforce runtime choices during window.print() -->
          <style id="dynamicPrintStyle">
            .print-grid { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 4px !important; align-items: start !important; }
            .single-table-wrapper { display: none !important; }
          </style>
        </head>
        <body class="text-black min-h-screen bg-white">
          <div class="no-print w-full mb-4 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl flex flex-wrap justify-between items-center gap-3 text-white">
            <div>
              <h3 class="text-xs font-bold font-mono">👁️ Full-Page Print Preview Mode (${subtitleText})</h3>
              <p class="text-[10px] text-slate-400 font-mono">Customize view, font sizes, and layout before printing</p>
            </div>
            
            <div class="flex flex-wrap items-center gap-3">
              <!-- Layout Toggle Button -->
              <button 
                onclick="toggleLayout()" 
                id="layoutToggleBtn"
                class="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow transition cursor-pointer flex items-center gap-1"
              >
                <span>📊</span> Switch to Inline Table View
              </button>

              <!-- Font Size Controls -->
              <div class="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg">
                <span class="text-[10px] text-slate-300 font-mono">Name Font:</span>
                <button onclick="adjustFontSize(-1)" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded text-xs cursor-pointer">-</button>
                <span id="fontSizeDisplay" class="text-xs font-mono text-emerald-400 w-6 text-center">9px</span>
                <button onclick="adjustFontSize(1)" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded text-xs cursor-pointer">+</button>
              </div>

              <button 
                onclick="window.print()" 
                class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow transition cursor-pointer flex items-center gap-1.5"
              >
                <span>🖨️</span> Print
              </button>
              <button 
                onclick="window.close()" 
                class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-1.5 rounded-lg text-xs transition cursor-pointer"
              >
                Close
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

            <!-- PARALLEL GRID VIEW -->
            <div id="parallelGrid" class="print-grid grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
              <table class="w-full border-collapse border border-gray-800 text-[8px] text-left table-fixed">
                <thead>
                  <tr class="bg-gray-200 border-b border-gray-800 text-black font-bold text-[7px] uppercase">
                    <th class="border border-gray-800 px-[1px] py-[0px] text-center w-[3%]">S.No</th>
                    <th class="border border-gray-800 px-[1px] py-[0px] w-[7%]">यू.टी. नं.</th>
                    <th class="border border-gray-800 px-[2px] py-[0px] w-[24%]">बंदी का नाम</th>
                    <th class="border border-gray-800 px-[2px] py-[0px] w-[24%]">पिता का नाम</th>
                    <th class="border border-gray-800 px-[1px] py-[0px] text-center w-[5%]">बैरक</th>
                    <th class="border border-gray-800 px-[1px] py-[0px] text-center w-[18%]">वारंट टाइप</th>
                    <th class="border border-gray-800 px-[1px] py-[0px] text-center w-[19%]">एफ.आई.आर. नं.</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderTableRows(leftRecords, 0)}
                </tbody>
              </table>

              <table class="w-full border-collapse border border-gray-800 text-[8px] text-left table-fixed">
                <thead>
                  <tr class="bg-gray-200 border-b border-gray-800 text-black font-bold text-[7px] uppercase">
                    <th class="border border-gray-800 px-[1px] py-[0px] text-center w-[3%]">S.No</th>
                    <th class="border border-gray-800 px-[1px] py-[0px] w-[7%]">यू.टी. नं.</th>
                    <th class="border border-gray-800 px-[2px] py-[0px] w-[24%]">बंदी का नाम</th>
                    <th class="border border-gray-800 px-[2px] py-[0px] w-[24%]">पिता का नाम</th>
                    <th class="border border-gray-800 px-[1px] py-[0px] text-center w-[5%]">बैरक</th>
                    <th class="border border-gray-800 px-[1px] py-[0px] text-center w-[18%]">वारंट टाइप</th>
                    <th class="border border-gray-800 px-[1px] py-[0px] text-center w-[19%]">एफ.आई.आर. नं.</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderTableRows(rightRecords, leftRecords.length)}
                </tbody>
              </table>
            </div>

            <!-- INLINE TABLE VIEW -->
            <div id="singleTableWrapper" class="single-table-wrapper hidden w-full">
              <table class="w-full border-collapse border border-gray-800 text-[8px] text-left table-fixed">
                <thead>
                  <tr class="bg-gray-200 border-b border-gray-800 text-black font-bold text-[7px] uppercase">
                    <th class="border border-gray-800 px-[1px] py-[0px] text-center w-[3%]">S.No</th>
                    <th class="border border-gray-800 px-[1px] py-[0px] w-[7%]">यू.टी. नं.</th>
                    <th class="border border-gray-800 px-[2px] py-[0px] w-[24%]">बंदी का नाम</th>
                    <th class="border border-gray-800 px-[2px] py-[0px] w-[24%]">पिता का नाम</th>
                    <th class="border border-gray-800 px-[1px] py-[0px] text-center w-[5%]">बैरक</th>
                    <th class="border border-gray-800 px-[1px] py-[0px] text-center w-[18%]">वारंट टाइप</th>
                    <th class="border border-gray-800 px-[1px] py-[0px] text-center w-[19%]">एफ.आई.आर. नं.</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderTableRows(translatedRecords, 0)}
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

          <script>
            let currentFontSize = 9;
            function updatePrintStyles() {
              const styleTag = document.getElementById('dynamicPrintStyle');
              const isInline = document.getElementById('singleTableWrapper').classList.contains('hidden') === false;

              styleTag.innerHTML = \`
                .adjustable-name { font-size: \${currentFontSize}px !important; }
                .print-grid { display: \${isInline ? 'none' : 'grid'} !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 4px !important; align-items: start !important; }
                .single-table-wrapper { display: \${isInline ? 'block' : 'none'} !important; width: 100% !important; }
              \`;
            }

            function adjustFontSize(delta) {
              currentFontSize = Math.max(6, Math.min(16, currentFontSize + delta));
              const elements = document.querySelectorAll('.adjustable-name');
              elements.forEach(el => {
                el.style.fontSize = currentFontSize + 'px';
              });
              document.getElementById('fontSizeDisplay').innerText = currentFontSize + 'px';
              updatePrintStyles();
            }

            let isInline = false;
            function toggleLayout() {
              isInline = !isInline;
              const parallelGrid = document.getElementById('parallelGrid');
              const singleWrapper = document.getElementById('singleTableWrapper');
              const btn = document.getElementById('layoutToggleBtn');

              if (isInline) {
                parallelGrid.classList.add('hidden');
                singleWrapper.classList.remove('hidden');
                btn.innerHTML = '<span>📊</span> Switch to Parallel Grid View';
              } else {
                singleWrapper.classList.add('hidden');
                parallelGrid.classList.remove('hidden');
                btn.innerHTML = '<span>📊</span> Switch to Inline Table View';
              }
              updatePrintStyles();
            }
          </script>
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
  }
};