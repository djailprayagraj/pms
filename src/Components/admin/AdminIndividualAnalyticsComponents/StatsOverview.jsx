import React from 'react';

export default function StatsOverview({ prisonerStats }) {
  const totalProductions = prisonerStats?.totalProductions || 0;
  const vcCount = prisonerStats?.vcCount || 0;
  const physicalCount = prisonerStats?.physicalCount || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Productions Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <span className="text-xs font-mono uppercase text-slate-400">Total Productions (In Date Range)</span>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">{totalProductions}</span>
          <span className="text-xs text-slate-400 font-mono">Hearings</span>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs font-mono">
          <span className="text-emerald-400">🖥️ VC: <strong>{vcCount}</strong></span>
          <span className="text-amber-400">🏛️ Physical: <strong>{physicalCount}</strong></span>
        </div>
      </div>

      {/* Warrant Breakdown Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg md:col-span-2 space-y-3">
        <span className="text-xs font-mono uppercase text-slate-400">Warrant Type Breakdown (VC vs Physical)</span>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 font-mono">167/187 (Remand)</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">
              {(prisonerStats?.vc167 || 0) + (prisonerStats?.physical167 || 0)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              VC: {prisonerStats?.vc167 || 0} | Phys: {prisonerStats?.physical167 || 0}
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 font-mono">209/232 (Committal)</div>
            <div className="text-xl font-bold text-purple-400 font-mono mt-1">
              {(prisonerStats?.vc209 || 0) + (prisonerStats?.physical209 || 0)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              VC: {prisonerStats?.vc209 || 0} | Phys: {prisonerStats?.physical209 || 0}
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 font-mono">309/346 (Trial)</div>
            <div className="text-xl font-bold text-indigo-400 font-mono mt-1">
              {(prisonerStats?.vc309 || 0) + (prisonerStats?.physical309 || 0)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              VC: {prisonerStats?.vc309 || 0} | Phys: {prisonerStats?.physical309 || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}