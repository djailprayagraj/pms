import React from 'react';

export default function SearchToolbar({
  searchInput,
  setSearchInput,
  startDate,
  endDate,
  onDateChange,
  onSearch,
  loading,
  prisonersList,
  onQuickSelect,
  errorMessage,
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span>🔍</span> Exact UT Number Search & Production Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter exact UT number and select a date bracket to view comprehensive hearing intelligence.
          </p>
        </div>

        <form onSubmit={onSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Exact UT Number..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800 text-xs">
        <span className="text-slate-300 font-mono font-bold">📅 Date Range:</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onDateChange(e.target.value, endDate)}
          className="bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-red-500"
        />
        <span className="text-slate-400 font-bold">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onDateChange(startDate, e.target.value)}
          className="bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Quick Suggestions Chips */}
      <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
        <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap">Quick Select UT:</span>
        {prisonersList.slice(0, 6).map((p, idx) => {
          const ut = p.RegisterNo || p.utNumber;
          if (!ut) return null;
          return (
            <button
              key={idx}
              onClick={() => onQuickSelect(p)}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-[11px] px-2.5 py-1 rounded-md border border-slate-700 transition whitespace-nowrap cursor-pointer"
            >
              {ut}
            </button>
          );
        })}
      </div>

      {errorMessage && (
        <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-2.5 rounded-lg font-mono">
          ⚠️ {errorMessage}
        </div>
      )}
    </div>
  );
}