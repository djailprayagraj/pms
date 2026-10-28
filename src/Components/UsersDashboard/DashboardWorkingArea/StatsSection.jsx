import React, { useState, useMemo } from 'react';

const StatsSection = ({ prisoner, groupData = [] }) => {
  const [showCasesModal, setShowCasesModal] = useState(false);
  
  // Date Range State for filtering productions/hearings
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Toggle between viewing individual prisoner stats vs group/aggregate stats
  const [viewMode, setViewMode] = useState('individual'); // 'individual' | 'group'

  // Filter and compute stats based on date range and view mode
  const stats = useMemo(() => {
    const rawDataset = viewMode === 'group' ? groupData : [prisoner].filter(Boolean);

    if (!rawDataset.length) {
      return {
        totalProductions: 0,
        vcCount: 0,
        inPersonCount: 0,
        activeCases: 0,
        totalCases: 0,
        mulaqatVisits: 0,
        medicalVisits: 0,
        uniqueFirList: []
      };
    }

    let totalProductions = 0;
    let vcCount = 0;
    let inPersonCount = 0;
    let mulaqatVisits = 0;
    let medicalVisits = 0;
    
    // Using a Set to collect unique FIR numbers across cases
    const uniqueFirs = new Set();
    let activeCasesCount = 0;

    rawDataset.forEach((item) => {
      if (!item) return;

      // 1. Productions / Court Hearings Filtered by Date Range
      const productions = item.productions || item.Productions || item.courtHearings || [];
      const filteredProductions = productions.filter((p) => {
        const pDate = p.date || p.hearingDate || p.timestamp;
        if (!pDate) return true;
        if (dateRange.startDate && pDate < dateRange.startDate) return false;
        if (dateRange.endDate && pDate > dateRange.endDate) return false;
        return true;
      });

      totalProductions += filteredProductions.length;
      vcCount += filteredProductions.filter(
        (p) =>
          p.mode?.toLowerCase() === 'vc' ||
          p.mode?.toLowerCase() === 'video conference' ||
          p.productionMode === 'VC' ||
          p.isVc === true
      ).length;

      inPersonCount += filteredProductions.filter(
        (p) =>
          p.mode?.toLowerCase() === 'physical' ||
          p.mode?.toLowerCase() === 'in-person' ||
          p.productionMode === 'Physical' ||
          p.isVc === false
      ).length;

      // 2. Cases Processing (Handling cases array from your logs)
      const cases = item.cases || item.Cases || [];
      cases.forEach((c) => {
        if (c.firNo) uniqueFirs.add(c.firNo);
        if (
          c.status?.toLowerCase() === 'active' ||
          c.caseStatus?.toLowerCase() === 'active' ||
          c.is_active === true ||
          c.Status === 'Under Trial' ||
          !c.status 
        ) {
          activeCasesCount++;
        }
      });

      // 3. Mulaqat & Medical
      mulaqatVisits += (item.mulaqatVisits || item.mulaqats || item.visitors || []).length;
      medicalVisits += (item.medicalVisits || item.medicalLogs || item.opdVisits || []).length;
    });

    return {
      totalProductions,
      vcCount,
      inPersonCount,
      activeCases: uniqueFirs.size > 0 ? uniqueFirs.size : activeCasesCount,
      totalCases: uniqueFirs.size > 0 ? uniqueFirs.size : (prisoner?.cases?.length || 0),
      mulaqatVisits,
      medicalVisits,
      uniqueFirList: Array.from(uniqueFirs)
    };
  }, [prisoner, groupData, dateRange, viewMode]);

  const safeTotal = stats.totalProductions > 0 ? stats.totalProductions : 1;

  // Extract fields matching your console log structure
  const prisonerName = prisoner?.prisonerName || prisoner?.["Prisoner Name"] || "Individual Prisoner";
  const prisonerId = prisoner?.JID || prisoner?.PID || prisoner?.jailId || (prisoner?.barrack ? `Barrack: ${prisoner.barrack}` : "Profile Summary");

  return (
    <div className="fixed bottom-0 right-0 left-64 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-6 py-3 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left: Prisoner Header & View/Date Controls */}
        <div className="flex items-center gap-4 w-full lg:w-auto pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-r border-slate-800 lg:pr-4">
          <div className="flex flex-col lg:max-w-[200px] shrink-0">
            <span className="text-[10px] font-mono text-blue-400 font-semibold uppercase tracking-wider truncate">
              {viewMode === 'group' ? `Group View (${groupData.length} records)` : prisonerId}
            </span>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide truncate" title={prisonerName}>
              {viewMode === 'group' ? 'Aggregated Ward/Block' : prisonerName}
            </h4>
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[10px] font-mono">
            <button
              onClick={() => setViewMode('individual')}
              className={`px-2 py-1 rounded-md transition ${viewMode === 'individual' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Single
            </button>
            <button
              onClick={() => setViewMode('group')}
              className={`px-2 py-1 rounded-md transition ${viewMode === 'group' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Group
            </button>
          </div>
        </div>

        {/* Middle-Left: Date Range Picker Inputs */}
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono">
          <span className="text-[10px] text-slate-400 uppercase">Filter:</span>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
            className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
            className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none focus:border-blue-500"
          />
          {(dateRange.startDate || dateRange.endDate) && (
            <button
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
              className="text-[10px] text-red-400 hover:text-red-300 ml-1 underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto flex-1 max-w-3xl justify-center mx-auto">

          {/* Stat 1: Productions */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400">
              <span>Productions</span>
              <span className="text-blue-400">⚖️</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white">{stats.totalProductions}</span>
              <span className="text-[10px] text-slate-400">Hearings</span>
            </div>
          </div>

          {/* Stat 2: VC vs Physical */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400">
              <span>VC / Physical</span>
              <span className="text-emerald-400">🖥️</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-bold text-xs">{stats.vcCount} <span className="text-[9px] font-normal text-slate-400">VC</span></span>
              <span className="text-slate-700">|</span>
              <span className="text-amber-400 font-bold text-xs">{stats.inPersonCount} <span className="text-[9px] font-normal text-slate-400">Phys</span></span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden flex">
              <div style={{ width: `${(stats.vcCount / safeTotal) * 100}%` }} className="bg-emerald-500 h-full"></div>
              <div style={{ width: `${(stats.inPersonCount / safeTotal) * 100}%` }} className="bg-amber-500 h-full"></div>
            </div>
          </div>

          {/* Stat 3: Cases (Clickable) */}
          <div
            onClick={() => setShowCasesModal(true)}
            className="bg-slate-900/80 border border-red-500/40 hover:border-red-500 rounded-xl p-3 flex flex-col justify-between shadow-sm cursor-pointer transition transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400">
              <span className="text-red-400 font-bold underline decoration-dotted">Cases (View)</span>
              <span className="text-red-400">📑</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white">{stats.totalCases}</span>
              <span className="text-[11px] text-slate-400">FIRs</span>
            </div>
          </div>

          {/* Stat 4: Visitors / Medical */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400">
              <span>Visitors/Med</span>
              <span className="text-purple-400">👥</span>
            </div>
            <div className="mt-1.5 flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] text-slate-400">Mulaqat: </span>
                <span className="font-bold text-white text-xs">{stats.mulaqatVisits}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400">OPD: </span>
                <span className="font-bold text-white text-xs">{stats.medicalVisits}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Optional Cases Modal Popup */}
      {showCasesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Cases / FIR Summary ({prisonerName})</h3>
              <button onClick={() => setShowCasesModal(false)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 flex-1 text-xs font-mono">
              {prisoner?.cases?.map((c, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 flex flex-col gap-1">
                  <div className="flex justify-between text-blue-400 font-bold">
                    <span>{c.firNo}</span>
                    <span className="text-slate-400">{c.psName}</span>
                  </div>
                  <div className="text-slate-300">Act/Section: <span className="text-white font-semibold">{c.actSection}</span></div>
                  <div className="text-slate-400 text-[10px]">Court: {c.courtName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsSection;