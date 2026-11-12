import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { fetchIndividualPrisonerStats } from '../../../api/statsApi';

const StatsSection = () => {
  // 1. Fetch UT number (part1) from Redux store
  const part1 = useSelector((state) => state.adalat?.part1 || '');

  // API Response States
  const [prisonerProfile, setPrisonerProfile] = useState(null);
  const [apiStats, setApiStats] = useState({
    totalProductions: 0,
    vcCount: 0,
    physicalCount: 0,
    vc167: 0,
    physical167: 0,
    vc209: 0,
    physical209: 0,
    vc309: 0,
    physical309: 0,
    firstHearingDate: null,
    lastHearingDate: null,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Date Range & Quick Preset State
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [activePreset, setActivePreset] = useState('');

  // Helper to format Date as YYYY-MM-DD in local time
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Apply quick date presets
  const applyDatePreset = (preset) => {
    const today = new Date();
    let start = '';
    let end = formatDate(today);

    if (preset === 'today') {
      start = formatDate(today);
    } else if (preset === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      start = formatDate(yesterday);
      end = formatDate(yesterday);
    } else if (preset === 'lastMonth') {
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);
      start = formatDate(lastMonth);
    } else if (preset === 'lastYear') {
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      start = formatDate(lastYear);
    }

    setActivePreset(preset);
    setDateRange({ startDate: start, endDate: end });
  };

  const handleManualDateChange = (field, value) => {
    setActivePreset('');
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetDates = () => {
    setActivePreset('');
    setDateRange({ startDate: '', endDate: '' });
  };

  // 2. Fetch API data when part1 (UT Number) or date range changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!part1 || !part1.trim()) {
        setPrisonerProfile(null);
        setApiStats({
          totalProductions: 0,
          vcCount: 0,
          physicalCount: 0,
          vc167: 0,
          physical167: 0,
          vc209: 0,
          physical209: 0,
          vc309: 0,
          physical309: 0,
          firstHearingDate: null,
          lastHearingDate: null,
        });
        return;
      }

      setLoading(true);
      setErrorMsg('');

      try {
        const response = await fetchIndividualPrisonerStats(
          {
            query: {
              utNumber: part1.trim(),
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }
          },
          {
            status: (code) => ({
              json: (data) => data
            })
          }
        );

        const data = response?.data || response;

        if (data && data.success) {
          setPrisonerProfile(data.profile);
          setApiStats(data.stats);
        } else {
          setErrorMsg(data?.message || 'No records found');
          setPrisonerProfile(null);
          setApiStats({
            totalProductions: 0,
            vcCount: 0,
            physicalCount: 0,
            vc167: 0,
            physical167: 0,
            vc209: 0,
            physical209: 0,
            vc309: 0,
            physical309: 0,
            firstHearingDate: null,
            lastHearingDate: null,
          });
        }
      } catch (err) {
        console.error('Error loading prisoner stats:', err);
        setErrorMsg('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [part1, dateRange.startDate, dateRange.endDate]);

  // Compute individual stats
  const stats = useMemo(() => {
    return {
      totalProductions: apiStats.totalProductions || 0,
      vcCount: apiStats.vcCount || 0,
      inPersonCount: apiStats.physicalCount || 0,
      vc167: apiStats.vc167 || 0,
      physical167: apiStats.physical167 || 0,
      vc209: apiStats.vc209 || 0,
      physical209: apiStats.physical209 || 0,
      vc309: apiStats.vc309 || 0,
      physical309: apiStats.physical309 || 0,
    };
  }, [apiStats]);

  const safeTotal = stats.totalProductions > 0 ? stats.totalProductions : 1;

  // Extract fields matching backend profile structure
  const prisonerName = prisonerProfile?.prisonerName || "Individual Prisoner";
  const prisonerId = prisonerProfile?.utNumbers?.[0] || (prisonerProfile?.barrack ? `Barrack: ${prisonerProfile.barrack}` : (part1 ? `UT: ${part1}` : "Profile Summary"));
  const custodyStatus = prisonerProfile?.custodyStatus || "ACTIVE";

  return (
    <div className="fixed bottom-0 right-0 left-64 z-40 bg-slate-900/98 backdrop-blur-xl border-t-2 border-slate-700 px-8 py-4 shadow-2xl transition-all duration-300 w-auto">
      <div className="w-full flex flex-col 2xl:flex-row items-center justify-between gap-5">
        
        {/* Left: Prisoner Header & Status */}
        <div className="flex items-center gap-6 w-full 2xl:w-auto pb-3 2xl:pb-0 border-b 2xl:border-b-0 2xl:border-r border-slate-700 2xl:pr-6 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider truncate">
                {prisonerId}
              </span>
              <span className={`px-2.5 py-0.5 text-[10px] rounded-md font-mono font-bold uppercase ${custodyStatus === 'RIHA' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                {custodyStatus}
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-white font-mono uppercase tracking-wide truncate mt-1.5" title={prisonerName}>
              {loading ? 'Loading...' : prisonerName}
            </h4>
          </div>
        </div>

        {/* Middle: Date Presets & Custom Range Picker */}
        <div className="flex flex-col gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 font-mono shrink-0 shadow-inner">
          {/* Quick Presets Row */}
          <div className="flex items-center justify-between gap-1.5">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Last Day' },
              { id: 'lastMonth', label: 'Last Month' },
              { id: 'lastYear', label: 'Last Year' },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyDatePreset(preset.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  activePreset === preset.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-950 border border-slate-700/70'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Row */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Range:</span>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleManualDateChange('startDate', e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleManualDateChange('endDate', e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                type="button"
                onClick={handleResetDates}
                className="text-xs text-red-400 hover:text-red-300 ml-1 underline font-bold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Extended Metric Cards Grid (Stretched Horizontally) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full 2xl:flex-1 justify-center">

          {/* Card 1: Total Productions */}
          <div className="bg-slate-950/80 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 font-semibold">
              <span>Total Prod</span>
              <span className="text-blue-400 text-sm">⚖️</span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">{stats.totalProductions}</span>
              <span className="text-xs text-slate-400 font-medium">Hearings</span>
            </div>
          </div>

          {/* Card 2: VC vs Physical Overview */}
          <div className="bg-slate-950/80 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 font-semibold">
              <span>VC / Phys</span>
              <span className="text-emerald-400 text-sm">🖥️</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold text-sm">{stats.vcCount} <span className="text-[10px] text-slate-400 font-normal">VC</span></span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-bold text-sm">{stats.inPersonCount} <span className="text-[10px] text-slate-400 font-normal">Phys</span></span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden flex">
              <div style={{ width: `${(stats.vcCount / safeTotal) * 100}%` }} className="bg-emerald-500 h-full"></div>
              <div style={{ width: `${(stats.inPersonCount / safeTotal) * 100}%` }} className="bg-amber-500 h-full"></div>
            </div>
          </div>

          {/* Card 3: 167/187 Breakdown */}
          <div className="bg-slate-950/80 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-lg font-mono hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-xs uppercase text-slate-400 font-semibold">
              <span>Sec 167/187</span>
              <span className="text-indigo-400 text-sm">📋</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-bold text-sm">{stats.vc167} <span className="text-[10px] text-slate-400 font-normal">VC</span></span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-bold text-sm">{stats.physical167} <span className="text-[10px] text-slate-400 font-normal">Phys</span></span>
            </div>
            <div className="text-[11px] text-slate-300 font-bold mt-1.5">Total: {stats.vc167 + stats.physical167}</div>
          </div>

          {/* Card 4: 209/232 Breakdown */}
          <div className="bg-slate-950/80 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-lg font-mono hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-xs uppercase text-slate-400 font-semibold">
              <span>Sec 209/232</span>
              <span className="text-indigo-400 text-sm">📋</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-bold text-sm">{stats.vc209} <span className="text-[10px] text-slate-400 font-normal">VC</span></span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-bold text-sm">{stats.physical209} <span className="text-[10px] text-slate-400 font-normal">Phys</span></span>
            </div>
            <div className="text-[11px] text-slate-300 font-bold mt-1.5">Total: {stats.vc209 + stats.physical209}</div>
          </div>

          {/* Card 5: 309/346 Breakdown */}
          <div className="bg-slate-950/80 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-lg font-mono hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between text-xs uppercase text-slate-400 font-semibold">
              <span>Sec 309/346</span>
              <span className="text-indigo-400 text-sm">📋</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-bold text-sm">{stats.vc309} <span className="text-[10px] text-slate-400 font-normal">VC</span></span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-bold text-sm">{stats.physical309} <span className="text-[10px] text-slate-400 font-normal">Phys</span></span>
            </div>
            <div className="text-[11px] text-slate-300 font-bold mt-1.5">Total: {stats.vc309 + stats.physical309}</div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StatsSection;