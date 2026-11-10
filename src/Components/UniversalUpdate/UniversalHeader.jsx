import React from 'react';

const UniversalHeader = ({ onOpenCourtModal, onOpenCreateModal }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
      <div>
        <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Universal Adalat Log Management & CRUD Dashboard
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Manage, update, and replace Adalat appearance records and master court details.
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenCourtModal}
          className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-mono text-[11px] px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          Replace Court Names
        </button>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition shadow-md flex items-center gap-1 cursor-pointer"
        >
          + New Log Entry
        </button>
      </div>
    </div>
  );
};

export default UniversalHeader;