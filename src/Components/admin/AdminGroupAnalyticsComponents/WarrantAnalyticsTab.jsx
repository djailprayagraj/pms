import React from 'react';

export default function WarrantAnalyticsTab({ serverStats, startDate, endDate }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div>
        <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-1">
          Backend Cross-Tabulated Warrant & Mode Intelligence
        </h4>
        <p className="text-xs text-slate-300">
          Precise breakdown of warrant categories categorized by production mode (`VC` vs `Session Adalat`) for range <span className="text-white font-mono font-bold">{startDate}</span> to <span className="text-white font-mono font-bold">{endDate}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4 shadow-lg">
          <span className="text-xs font-mono uppercase text-emerald-400 font-extrabold tracking-wider">🖥️ Virtual Conference (VC) Breakdown</span>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 shadow">
              <div className="text-[11px] font-mono text-slate-400 font-bold">167/187</div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1.5">{serverStats.vc167}</div>
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 shadow">
              <div className="text-[11px] font-mono text-slate-400 font-bold">209/232</div>
              <div className="text-2xl font-black text-purple-400 font-mono mt-1.5">{serverStats.vc209}</div>
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 shadow">
              <div className="text-[11px] font-mono text-slate-400 font-bold">309/346</div>
              <div className="text-2xl font-black text-indigo-400 font-mono mt-1.5">{serverStats.vc309}</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4 shadow-lg">
          <span className="text-xs font-mono uppercase text-amber-400 font-extrabold tracking-wider">🏛️ Session Adalat Breakdown</span>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 shadow">
              <div className="text-[11px] font-mono text-slate-400 font-bold">167/187</div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1.5">{serverStats.session167}</div>
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 shadow">
              <div className="text-[11px] font-mono text-slate-400 font-bold">209/232</div>
              <div className="text-2xl font-black text-purple-400 font-mono mt-1.5">{serverStats.session209}</div>
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 shadow">
              <div className="text-[11px] font-mono text-slate-400 font-bold">309/346</div>
              <div className="text-2xl font-black text-indigo-400 font-mono mt-1.5">{serverStats.session309}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}