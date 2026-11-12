import React from 'react';

export default function StatisticsGrid({
  serverStats,
  selectedWarrantType,
  setSelectedWarrantType,
  selectedModeFilter,
  setSelectedModeFilter,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Card with VC & Session Breakdown */}
      <div
        onClick={() => { setSelectedWarrantType('ALL'); setSelectedModeFilter('ALL'); }}
        className="bg-slate-900 border-2 border-slate-700 hover:border-slate-500 rounded-2xl p-5 flex flex-col justify-between shadow-xl cursor-pointer transition"
      >
        <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-300 font-bold">
          <span>Total Productions</span>
          <span>⚖️</span>
        </div>
        <div className="mt-3 text-4xl font-black text-white">{serverStats.totalInRange}</div>
        
        <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-xs font-mono">
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedModeFilter(selectedModeFilter === 'VC' ? 'ALL' : 'VC'); }}
            className={`px-3 py-1 rounded-lg transition cursor-pointer font-bold ${selectedModeFilter === 'VC' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'}`}
          >
            🖥️ VC: {serverStats.vcCount}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedModeFilter(selectedModeFilter === 'SESSION_ADALAT' ? 'ALL' : 'SESSION_ADALAT'); }}
            className={`px-3 py-1 rounded-lg transition cursor-pointer font-bold ${selectedModeFilter === 'SESSION_ADALAT' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-amber-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60'}`}
          >
            🏛️ Session: {serverStats.sessionCount}
          </button>
        </div>
      </div>

      {/* Remand Card */}
      <div
        onClick={() => setSelectedWarrantType(selectedWarrantType === '167/187' ? 'ALL' : '167/187')}
        className={`bg-slate-900 border-2 rounded-2xl p-5 flex flex-col justify-between shadow-xl cursor-pointer transition ${selectedWarrantType === '167/187' ? 'border-amber-400 bg-amber-950/20' : 'border-slate-700 hover:border-slate-500'}`}
      >
        <div className="flex items-center justify-between text-xs font-mono uppercase text-amber-300 font-bold">
          <span>Sec 167 / 187 Remand</span>
          <span>📋</span>
        </div>
        <div className="mt-3 text-4xl font-black text-amber-400">{serverStats.count167}</div>
        <p className="text-xs text-slate-300 mt-3 font-mono bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
          VC: <strong className="text-emerald-400">{serverStats.vc167}</strong> | Session: <strong className="text-amber-400">{serverStats.session167}</strong>
        </p>
      </div>

      {/* Committal Card */}
      <div
        onClick={() => setSelectedWarrantType(selectedWarrantType === '209/232' ? 'ALL' : '209/232')}
        className={`bg-slate-900 border-2 rounded-2xl p-5 flex flex-col justify-between shadow-xl cursor-pointer transition ${selectedWarrantType === '209/232' ? 'border-purple-400 bg-purple-950/20' : 'border-slate-700 hover:border-slate-500'}`}
      >
        <div className="flex items-center justify-between text-xs font-mono uppercase text-purple-300 font-bold">
          <span>Sec 209 / 232 Committal</span>
          <span>🏛️</span>
        </div>
        <div className="mt-3 text-4xl font-black text-purple-400">{serverStats.count209}</div>
        <p className="text-xs text-slate-300 mt-3 font-mono bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
          VC: <strong className="text-emerald-400">{serverStats.vc209}</strong> | Session: <strong className="text-amber-400">{serverStats.session209}</strong>
        </p>
      </div>

      {/* Trial Card */}
      <div
        onClick={() => setSelectedWarrantType(selectedWarrantType === '309/346' ? 'ALL' : '309/346')}
        className={`bg-slate-900 border-2 rounded-2xl p-5 flex flex-col justify-between shadow-xl cursor-pointer transition ${selectedWarrantType === '309/346' ? 'border-indigo-400 bg-indigo-950/20' : 'border-slate-700 hover:border-slate-500'}`}
      >
        <div className="flex items-center justify-between text-xs font-mono uppercase text-indigo-300 font-bold">
          <span>Sec 309 / 346 Trial</span>
          <span>📑</span>
        </div>
        <div className="mt-3 text-4xl font-black text-indigo-400">{serverStats.count309}</div>
        <p className="text-xs text-slate-300 mt-3 font-mono bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
          VC: <strong className="text-emerald-400">{serverStats.vc309}</strong> | Session: <strong className="text-amber-400">{serverStats.session309}</strong>
        </p>
      </div>
    </div>
  );
}