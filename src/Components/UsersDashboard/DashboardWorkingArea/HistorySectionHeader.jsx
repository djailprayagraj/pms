import React from 'react';

const HistorySectionHeader = ({
  selectedDate,
  setSelectedDate,
  isLoadingDb,
  fetchDbRecords,
  handlePrintClick,
  isTranslating,
  recordCount,
  onClose,
}) => {
  return (
    <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3 shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">📜</span>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Database Synced Records {isLoadingDb && '(Loading...)'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Grouped by inmate with consolidated case logs</p>
        </div>
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
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          {isLoadingDb ? 'Refreshing...' : 'Refresh'}
        </button>
        <button
          type="button"
          onClick={handlePrintClick}
          disabled={isTranslating || recordCount === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition"
        >
          {isTranslating ? 'हिंदी रूपांतरण जारी...' : `Print Hindi Log (${recordCount})`}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default HistorySectionHeader;