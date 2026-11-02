import React from 'react';

const SummaryBanner = ({ fromDate, toDate, appearanceFilter, totalInmates, grandTotalWarrants }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 shadow-lg flex flex-wrap justify-between items-center text-xs font-mono">
      <div className="text-slate-300">
        📊 Consolidated Summary for <strong className="text-white">{fromDate} to {toDate}</strong> ({appearanceFilter}):
      </div>
      <div className="flex items-center gap-4">
        <span className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-slate-300">
          Total Inmates: <strong className="text-white">{totalInmates}</strong>
        </span>
        <span className="bg-emerald-950/80 px-3 py-1.5 rounded border border-emerald-800 text-emerald-300">
          Grand Total Warrants: <strong className="text-emerald-200 font-bold">{grandTotalWarrants}</strong>
        </span>
      </div>
    </div>
  );
};

export default SummaryBanner;