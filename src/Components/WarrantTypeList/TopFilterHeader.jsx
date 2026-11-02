import React from 'react';

const TopFilterHeader = ({
  appearanceFilter,
  setAppearanceFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  fetchWarrantLogsRange,
  handleOpenPrintPreview,
  loading,
  isTranslating,
  recordsCount,
}) => {
  return (
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
        <div className="flex bg-slate-950 border border-slate-700 p-1 rounded-lg">
          {['ALL', 'SESSION', 'VC'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAppearanceFilter(mode)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                appearanceFilter === mode
                  ? mode === 'SESSION' ? 'bg-emerald-600 text-white shadow' : mode === 'VC' ? 'bg-amber-600 text-white shadow' : 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'ALL' ? 'All' : mode === 'SESSION' ? 'Session' : 'VC'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg">
          <span className="text-xs text-slate-400 font-mono">From:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-transparent text-white text-xs font-mono outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg">
          <span className="text-xs text-slate-400 font-mono">To:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-transparent text-white text-xs font-mono outline-none cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={fetchWarrantLogsRange}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 text-white font-semibold text-xs px-4 py-2 rounded-lg border border-emerald-500/40 shadow cursor-pointer transition flex items-center gap-1.5"
        >
          <span>🔍</span>
          <span>{loading ? 'Fetching...' : 'Fetch Records'}</span>
        </button>

        <button
          type="button"
          onClick={handleOpenPrintPreview}
          disabled={isTranslating || recordsCount === 0}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 text-white font-semibold text-xs px-4 py-2 rounded-lg border border-indigo-500/40 shadow cursor-pointer transition flex items-center gap-1.5"
        >
          <span>🖨️</span>
          <span>{isTranslating ? 'रूपांतरण...' : `Print 3 Tables (${recordsCount})`}</span>
        </button>
      </div>
    </div>
  );
};

export default TopFilterHeader;