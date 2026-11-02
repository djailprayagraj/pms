import { sortRecordsWithFemalesLast, calculateTotalWarrants, isFemaleInmate, smartTransliterateMixedString } from './helpers';

export const generateAndOpenPrintPreview = async ({ filteredRecords, appearanceFilter, fromDate, toDate, warrantGroups, grandTotalWarrants, setIsTranslating }) => {
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

    const renderTableRows = (items, startIndex, fontSizeClass) => {
      if (!items || items.length === 0) {
        return `<tr><td colspan="8" class="border border-gray-800 text-center py-1 italic">कोई रिकॉर्ड नहीं</td></tr>`;
      }
      return items
        .map((record, idx) => {
          const key = record._id || record.utNumber;
          const translated = translatedMap.get(key) || record;
          const isFemale = isFemaleInmate(record);
          const warrantCountVal = record.warrantCount !== undefined && record.warrantCount !== null ? record.warrantCount : 'N/A';
          return `
            <tr class="even:bg-gray-50 border-b border-gray-400 ${isFemale ? 'bg-pink-50/40' : ''}">
              <td class="border border-gray-800 px-0.5 py-0.5 text-center font-bold english-num w-6 leading-tight"><span>${startIndex + idx + 1}</span></td>
              <td class="border border-gray-800 px-1 py-0.5 font-semibold english-num w-12 leading-tight"><span>${translated.utNumber || 'N/A'}</span></td>
              <td class="border border-gray-800 px-1.5 py-0.5 font-bold leading-tight"><span class="english-num">${translated.prisonerNameHi}</span></td>
              <td class="border border-gray-800 px-1.5 py-0.5 leading-tight"><span class="english-num">${translated.fatherNameHi}</span></td>
              <td class="border border-gray-800 px-0.5 py-0.5 text-center font-semibold english-num w-10 leading-tight"><span>${translated.barrack || 'N/A'}</span></td>
              <td class="border border-gray-800 px-0.5 py-0.5 text-center font-extrabold english-num w-12 leading-tight text-black"><span>${warrantCountVal}</span></td>
              <td class="border border-gray-800 px-0.5 py-0.5 text-center font-bold english-num w-12 leading-tight"><span>${translated.warrantType || '167/187'}</span></td>
              <td class="border border-gray-800 px-1 py-0.5 english-num w-14 leading-tight"><span>${translated.firNumber || 'N/A'}</span></td>
            </tr>
          `;
        })
        .join('');
    };

    const renderWarrantSectionHtml = (title, items, fontSizeClass) => {
      const sortedItems = sortRecordsWithFemalesLast(items);
      const sectionTotalWarrants = calculateTotalWarrants(sortedItems);
      const displayDate = fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`;
      return `
        <div class="mb-4 page-break-inside-avoid warrant-section">
          <div class="flex justify-between items-center bg-gray-200 border border-gray-800 px-2 py-0.5 mb-1 uppercase font-bold" style="font-size: calc(var(--base-font) + 1px);">
            <span>Warrant Type: ${title} (${sortedItems.length} Inmates | Total Warrants: ${sectionTotalWarrants})</span>
            <span class="english-num">Date: ${displayDate}</span>
          </div>
          <table class="w-full border-collapse border border-gray-800 text-left">
            <thead>
              <tr class="bg-gray-100 border-b border-gray-800 text-black font-bold uppercase" style="font-size: var(--base-font);">
                <th class="border border-gray-800 px-0.5 py-0.5 text-center w-6">S.No</th>
                <th class="border border-gray-800 px-1 py-0.5 w-12">यू.टी. नं.</th>
                <th class="border border-gray-800 px-1.5 py-0.5">बंदी का नाम</th>
                <th class="border border-gray-800 px-1.5 py-0.5">पिता का नाम</th>
                <th class="border border-gray-800 px-0.5 py-0.5 text-center w-10">बैरक</th>
                <th class="border border-gray-800 px-0.5 py-0.5 text-center w-12">वारंट संख्या</th>
                <th class="border border-gray-800 px-0.5 py-0.5 text-center w-12">वारंट टाइप</th>
                <th class="border border-gray-800 px-1 py-0.5 w-14">एफ.आई.आर. नं.</th>
              </tr>
            </thead>
            <tbody style="font-size: var(--base-font);">
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
            :root {
              --base-font: 10px;
            }
            body {
              font-family: 'Tiro Devanagari Hindi', 'Noto Sans Devanagari', sans-serif;
              background-color: #f1f5f9 !important;
              margin: 0;
              padding: 12px;
              font-size: var(--base-font);
            }
            .english-num {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace !important;
              font-variant-numeric: latin !important;
            }
            /* Layout Configurations */
            .tables-wrapper.stacked {
              display: block;
            }
            .tables-wrapper.inline-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 12px;
            }
            .tables-wrapper.inline-flex {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
            }
            .tables-wrapper.inline-flex .warrant-section {
              flex: 1 1 48%;
            }

            @media print {
              body { padding: 0 !important; margin: 0 !important; background-color: #ffffff !important; }
              @page { size: A4 portrait; margin: 6mm 4mm; }
              tr { page-break-inside: avoid; }
              .page-break-inside-avoid { page-break-inside: avoid; }
              .signature-block { page-break-inside: avoid; margin-top: 10px !important; }
              .print-container { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 auto !important; border: none !important; box-shadow: none !important; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="text-black min-h-screen">
          <!-- Floating Control Panel for Table & Font Customization -->
          <div class="no-print w-full mb-4 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl flex flex-wrap justify-between items-center text-white gap-3">
            <div>
              <h3 class="text-xs font-bold font-mono">⚙️ Print Customizer Panel</h3>
              <p class="text-[10px] text-slate-400 font-mono">Adjust font size or layout alignment before printing.</p>
            </div>
            
            <div class="flex flex-wrap items-center gap-3">
              <!-- Font Size Control -->
              <div class="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono">
                <span>Font Size:</span>
                <button onclick="adjustFontSize(-1)" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded font-bold cursor-pointer">-</button>
                <span id="font-size-display" class="w-8 text-center text-amber-400 font-bold">10px</span>
                <button onclick="adjustFontSize(1)" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded font-bold cursor-pointer">+</button>
              </div>

              <!-- Layout Alignment Control -->
              <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-700 text-xs font-mono">
                <button onclick="setLayout('stacked')" id="btn-stacked" class="px-2 py-1 rounded bg-indigo-600 text-white font-bold transition cursor-pointer">Stacked</button>
                <button onclick="setLayout('inline-grid')" id="btn-grid" class="px-2 py-1 rounded text-slate-400 hover:text-white transition cursor-pointer">Side-by-Side Grid</button>
              </div>

              <button onclick="window.print()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow transition cursor-pointer">🖨️ Print Now</button>
              <button onclick="window.close()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-1.5 rounded-lg text-xs transition cursor-pointer">Close</button>
            </div>
          </div>

          <div class="print-container w-full max-w-[202mm] mx-auto bg-white p-2 shadow-xl rounded">
            <div class="text-center border-b border-black pb-1 mb-2">
              <h1 class="text-sm font-black uppercase tracking-wider leading-tight">जिला कारागार प्रबंधन प्रणाली</h1>
              <h2 class="text-xs font-extrabold text-gray-900 mt-0.5 uppercase tracking-wide">
                ADALAT PESHI LIST (${appearanceFilter}) - <span class="english-num">${fromDate} से ${toDate}</span>
              </h2>
              <div class="flex justify-between items-center mt-0.5 text-[9px] font-semibold text-gray-700 border-t border-gray-200 pt-0.5">
                <span>कुल बंदी: <strong class="text-black english-num">${filteredRecords.length}</strong></span>
                <span>कुल वारंट संख्या: <strong class="text-black english-num">${grandTotalWarrants}</strong></span>
                <span>अवधि: <strong class="text-black english-num">${fromDate} से ${toDate}</strong></span>
              </div>
            </div>

            <!-- Tables Wrapper with Switchable Layout Class -->
            <div id="tables-container" class="tables-wrapper stacked">
              ${renderWarrantSectionHtml('167/187', warrantGroups['167/187'])}
              ${renderWarrantSectionHtml('209/232', warrantGroups['209/232'])}
              ${renderWarrantSectionHtml('309/346', warrantGroups['309/346'])}
            </div>

            <div class="signature-block mt-4 flex justify-end items-end text-[10px] font-bold pt-2">
              <div class="text-center">
                <div class="border-t border-black w-28 mb-0.5"></div>
                <p>(हवालात प्रभारी)</p>
              </div>
            </div>
          </div>

          <script>
            let currentSize = 10;

            function adjustFontSize(delta) {
              currentSize = Math.max(8, Math.min(16, currentSize + delta));
              document.documentElement.style.setProperty('--base-font', currentSize + 'px');
              document.getElementById('font-size-display').innerText = currentSize + 'px';
            }

            function setLayout(layoutType) {
              const container = document.getElementById('tables-container');
              container.className = 'tables-wrapper ' + layoutType;

              document.getElementById('btn-stacked').className = layoutType === 'stacked' ? 'px-2 py-1 rounded bg-indigo-600 text-white font-bold transition cursor-pointer' : 'px-2 py-1 rounded text-slate-400 hover:text-white transition cursor-pointer';
              document.getElementById('btn-grid').className = layoutType === 'inline-grid' ? 'px-2 py-1 rounded bg-indigo-600 text-white font-bold transition cursor-pointer' : 'px-2 py-1 rounded text-slate-400 hover:text-white transition cursor-pointer';
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
      alert("Pop-up blocker prevented opening preview.");
    }
  } catch (err) {
    console.error("Preview error:", err);
  } finally {
    setIsTranslating(false);
  }
};