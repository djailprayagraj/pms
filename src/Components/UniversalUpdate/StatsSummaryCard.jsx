import React from 'react';

const StatsSummaryCard = ({ records, selectedIds }) => {
  const activeCount = records.filter((r) => r.custodyStatus === 'ACTIVE_CUSTODY').length;
  const rihaCount = records.filter((r) => r.custodyStatus === 'RIHA').length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-2 font-mono text-xs">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-slate-400">Total Filtered Logs:</span>
        <span className="text-white font-bold text-sm">{records.length}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-400">Selected Rows:</span>
        <span className="text-emerald-400 font-bold">{selectedIds.length}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-400">Active Custody:</span>
        <span className="text-indigo-400 font-bold">{activeCount}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-400">RIHA (Released):</span>
        <span className="text-amber-400 font-bold">{rihaCount}</span>
      </div>
    </div>
  );
};

export default StatsSummaryCard;