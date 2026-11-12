import React from 'react';

export default function DashboardHeader({ onExport }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
          <span>👥</span> Collective Group Warrant & Production Intelligence
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Backend intelligence calculates exact VC, Session, and Warrant breakdowns; records rendered via TanStack virtual scrolling.
        </p>
      </div>

      <button
        onClick={onExport}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold px-5 py-3 rounded-xl transition shadow flex items-center gap-2 cursor-pointer shrink-0"
      >
        📥 Export Loaded Report (.CSV)
      </button>
    </div>
  );
}