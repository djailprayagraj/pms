import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ImportEprisonData = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Frontend Excel Processing Handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file extension
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)\$/i)) {
      setErrorMsg('Please upload a valid Excel file (.xlsx, .xls) or CSV.');
      return;
    }

    setFile(selectedFile);
    setErrorMsg('');
    setParsedResult(null);

    // Read file in browser memory
    readExcelInBrowser(selectedFile);
  };

  const readExcelInBrowser = (fileToRead) => {
    setParsing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first worksheet name & data
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert worksheet rows directly to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log(`📄 Reading Sheet: "${sheetName}"`);
        console.log(`📊 Total Rows Found: ${jsonData.length}`);

        if (jsonData.length === 0) {
          setErrorMsg('The selected Excel sheet appears to be empty.');
          setParsing(false);
          return;
        }

        const headers = Object.keys(jsonData[0] || {});
        console.log('🔑 Column Headers (Use these for Mongoose Schema):', headers);
        console.log('📝 First Row Sample:', jsonData[0]);

        const resultObj = {
          success: true,
          fileName: fileToRead.name,
          sheetName: sheetName,
          totalRows: jsonData.length,
          headers: headers,
          sampleData: jsonData[0] || null,
          data: jsonData, // Full JSON dataset ready for backend POST
        };

        setParsedResult(resultObj);
      } catch (error) {
        console.error('❌ Error reading Excel file in browser:', error.message);
        setErrorMsg(`Failed to parse Excel file: ${error.message}`);
      } finally {
        setParsing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Error reading file from disk.');
      setParsing(false);
    };

    reader.readAsArrayBuffer(fileToRead);
  };

  // Optional: Send parsed JSON data to MongoDB express route
  const handleImportToBackend = async () => {
    if (!parsedResult || !parsedResult.data) return;

    setIsUploading(true);
    setErrorMsg('');

    try {
      // Example endpoint: Replace with your actual backend URL/service
      /*
      const response = await fetch('/api/eprison/import-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prisonersData: parsedResult.data }),
      });
      const data = await response.json();
      */

      // Simulating API network call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      console.log('✅ Dataset sent to backend:', parsedResult.data);
      if (onUploadSuccess) onUploadSuccess(parsedResult);
      alert(`Successfully processed ${parsedResult.totalRows} ePrisons inmate records!`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error sending imported dataset to backend server.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* File Upload Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">
            Import ePrisons Excel Data (Frontend Processing)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select an Excel workbook (.xlsx / .csv) exported from ePrisons portal. Parsed in browser before database ingestion.
          </p>
        </div>

        {/* Drag and Drop Input Area */}
        <label className="border-2 border-dashed border-slate-700 hover:border-red-500/80 bg-slate-950/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center group">
          <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-red-950/50 text-slate-400 group-hover:text-red-400 border border-slate-700 group-hover:border-red-800 flex items-center justify-center text-xl transition mb-2">
            📊
          </div>
          <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
            {file ? file.name : 'Click or Drag & Drop ePrisons Excel Sheet Here'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-1">
            Supports .xlsx, .xls, and .csv files
          </span>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {parsing && (
          <div className="text-xs font-mono text-red-400 animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Parsing Excel sheet rows on frontend...
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 px-3 py-2 rounded-lg text-xs font-mono">
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      {/* Parsed Inspection & Sample Data Results */}
      {parsedResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">
                ✓ Excel Parsed Successfully
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Sheet: "{parsedResult.sheetName}"
              </h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
              Total Valid Rows: <span className="text-red-400 font-bold">{parsedResult.totalRows}</span>
            </div>
          </div>

          {/* Extracted Schema Column Headers */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider mb-2">
              🔑 Extracted Column Headers ({parsedResult.headers.length})
            </h4>
            <div className="flex flex-wrap gap-1.5 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
              {parsedResult.headers.map((head, idx) => (
                <span
                  key={idx}
                  className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                >
                  {head}
                </span>
              ))}
            </div>
          </div>

          {/* Sample Row JSON Inspector */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider mb-2">
              📝 First Row Object Preview
            </h4>
            <pre className="bg-slate-950 border border-slate-800 text-emerald-400 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48">
              {JSON.stringify(parsedResult.sampleData, null, 2)}
            </pre>
          </div>

          {/* Backend Upload Trigger */}
          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              onClick={handleImportToBackend}
              disabled={isUploading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-950 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition shadow-lg cursor-pointer flex items-center gap-2"
            >
              {isUploading
                ? 'Uploading Dataset to MongoDB...'
                : `Upload ${parsedResult.totalRows} Inmate Records to Database`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportEprisonData;