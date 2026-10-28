import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import API from '../../api/axios'; // Custom Axios instance with BaseURL & Token interceptor

const ImportEprisonData = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // State for Import History details
  const [importHistory, setImportHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch import history from GET /api/data/importHistory
  const fetchImportHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await API.get('/api/data/importHistory');
      console.log('📊 Fetched import history:', response.data);
      if (response.data?.success) {
        setImportHistory(response.data.data);
      }
    } catch (err) {
      console.error('❌ Error fetching import history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch history on initial component load
  useEffect(() => {
    fetchImportHistory();
  }, []);

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

    // Read file in browser memory for preview inspection
    readExcelInBrowser(selectedFile);
  };

  const readExcelInBrowser = (fileToRead) => {
    setParsing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log(`📄 Reading Sheet: "${sheetName}"`);
        console.log(`📊 Total Rows Found: ${jsonData.length}`);

        if (jsonData.length === 0) {
          setErrorMsg('The selected Excel sheet appears to be empty.');
          setParsing(false);
          return;
        }

        const headers = Object.keys(jsonData[0] || {});

        const resultObj = {
          success: true,
          fileName: fileToRead.name,
          sheetName: sheetName,
          totalRows: jsonData.length,
          headers: headers,
          sampleData: jsonData[0] || null,
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

  // Upload raw file to backend using FormData (Multipart)
  const handleImportToBackend = async () => {
    if (!file) {
      setErrorMsg('No file selected to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await API.post('/api/data/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ File uploaded successfully to backend:', response.data);

      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

      alert(response.data?.message || 'Successfully imported prisoner records into MongoDB!');

      // Reset selection and refresh upload history statistics
      setFile(null);
      setParsedResult(null);
      fetchImportHistory();

    } catch (err) {
      console.error('❌ Error uploading file to backend:', err);
      const errorMessage =
        err.response?.data?.message || 'Failed to process Excel file and save to database.';
      setErrorMsg(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* 📊 REAL-TIME UPLOAD HISTORY SUMMARY CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Database System Status & Last Upload Info
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live metadata fetched from <code className="text-slate-400 font-mono">/api/data/importHistory</code>
            </p>
          </div>
          <button
            onClick={fetchImportHistory}
            disabled={loadingHistory}
            className="text-[11px] font-mono text-slate-400 hover:text-white bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 transition flex items-center gap-1.5"
          >
            🔄 {loadingHistory ? 'Refreshing...' : 'Refresh Info'}
          </button>
        </div>

        {loadingHistory ? (
          <div className="text-xs font-mono text-slate-500 animate-pulse py-4 text-center">
            Fetching last update metrics from database...
          </div>
        ) : importHistory ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Records Badge */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">
                Total Inmate Records
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {importHistory.totalPrisonerRecords ?? importHistory.totalRecords ?? 0}
              </div>
            </div>

            {/* Last Updated Date */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">
                Last Uploaded Date
              </span>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-1">
                {importHistory.lastUpdated
                  ? new Date(importHistory.lastUpdated).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'No upload recorded yet'}
              </div>
            </div>

            {/* Last Upload File Name */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">
                Last Upload File
              </span>
              <div className="text-sm font-bold text-slate-200 truncate mt-1">
                📄 {importHistory.lastUploadFile || importHistory.latestRecordSample?.fileName || 'N/A'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs font-mono text-slate-500 py-2">
            No history data available yet.
          </div>
        )}
      </div>

      {/* 📁 FILE UPLOAD BOX */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">
            Import ePrisons Excel Data
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select an Excel workbook (.xlsx / .csv) exported from ePrisons portal to send directly to backend.
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
            Inspecting Excel file on frontend...
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 px-3 py-2 rounded-lg text-xs font-mono">
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      {/* 🔍 PARSED INSPECTION & SAMPLE DATA RESULTS */}
      {parsedResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">
                ✓ File Ready for Upload
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
              {isUploading ? 'Uploading File to Backend...' : `Upload Excel File to Database`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportEprisonData;