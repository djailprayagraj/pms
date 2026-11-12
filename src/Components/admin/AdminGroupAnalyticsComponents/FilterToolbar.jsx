import React, { useState } from 'react';

export default function FilterToolbar({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchQuery,
  setSearchQuery,
  selectedWarrantType,
  setSelectedWarrantType,
  selectedModeFilter,
  setSelectedModeFilter,
  loadedCount,
  totalCount,
}) {
  const [datePreset, setDatePreset] = useState('custom');

  // Helper to format Date object to YYYY-MM-DD string
  const formatDateString = (date) => date.toISOString().split('T')[0];

  // Handle Preset Ranges
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const today = new Date();

    if (preset === 'today') {
      const formatted = formatDateString(today);
      setStartDate(formatted);
      setEndDate(formatted);
    } else if (preset === 'last7') {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 7);
      setStartDate(formatDateString(pastDate));
      setEndDate(formatDateString(today));
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(formatDateString(firstDay));
      setEndDate(formatDateString(today));
    } else if (preset === 'last30') {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 30);
      setStartDate(formatDateString(pastDate));
      setEndDate(formatDateString(today));
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-4 shadow-md backdrop-blur-sm">
      {/* Top Row: Date Presets, Date Pickers, & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Date Filters & Quick Presets Group */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-300 font-mono font-bold flex items-center gap-1">
            📅 Range:
          </span>

          {/* Quick Preset Buttons */}
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 font-mono">
            <button
              type="button"
              onClick={() => handlePresetChange('today')}
              className={`px-2.5 py-1 rounded-md transition ${datePreset === 'today' ? 'bg-red-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('last7')}
              className={`px-2.5 py-1 rounded-md transition ${datePreset === 'last7' ? 'bg-red-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Last 7D
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('thisMonth')}
              className={`px-2.5 py-1 rounded-md transition ${datePreset === 'thisMonth' ? 'bg-red-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('custom')}
              className={`px-2.5 py-1 rounded-md transition ${datePreset === 'custom' ? 'bg-slate-800 text-white font-bold shadow border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Custom
            </button>
          </div>

          {/* Date Inputs (Shown when Custom is selected or always available) */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset('custom');
              }}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            />
            <span className="text-slate-500 font-bold">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset('custom');
              }}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full lg:w-80">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search Name, UT No, or FIR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white pl-9 pr-4 py-2 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Dropdown Filters & Record Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="relative">
            <select
              value={selectedWarrantType}
              onChange={(e) => setSelectedWarrantType(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-red-500 font-semibold cursor-pointer appearance-none pr-8"
            >
              <option value="ALL">📋 All Warrant Categories</option>
              <option value="167/187">Sec 167/187 (Remand)</option>
              <option value="209/232">Sec 209/232 (Committal)</option>
              <option value="309/346">Sec 309/346 (Trial)</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">▼</span>
          </div>

          <div className="relative">
            <select
              value={selectedModeFilter}
              onChange={(e) => setSelectedModeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-red-500 font-semibold cursor-pointer appearance-none pr-8"
            >
              <option value="ALL">⚙️ All Production Modes</option>
              <option value="VC">🖥️ Virtual Conference (VC)</option>
              <option value="SESSION_ADALAT">🏛️ Session Adalat</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">▼</span>
          </div>
        </div>

        <div className="text-xs text-slate-300 font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          Showing <strong className="text-white text-sm">{loadedCount}</strong> of <strong className="text-emerald-400 text-sm">{totalCount}</strong> records
        </div>
      </div>
    </div>
  );
}