import React from 'react';

const PrisonerHeader = ({ prisoner, utNumber }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        {/* Prisoner Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-800 border-2 border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-white shadow-inner">
            {prisoner?.avatarInitials || utNumber?.slice(0, 3)}
          </div>
          <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
            prisoner?.status === 'Active Custody' 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}>
            {prisoner?.status || 'Active'}
          </span>
        </div>

        {/* Core Details */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {prisoner?.name || 'Unknown Prisoner'}
            </h1>
            <span className="font-mono text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-md">
              UT: {utNumber}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Jail Location: <span className="text-slate-200 font-medium">{prisoner?.jailName || 'Central District Jail'}</span>
          </p>
        </div>
      </div>

      {/* Entry & Release Timeline Badges */}
      <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
        <div className="bg-slate-950/60 border border-slate-800/80 px-4 py-3 rounded-lg flex-1 md:flex-initial">
          <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Entry Date</span>
          <span className="text-sm font-mono text-indigo-300 font-semibold">{prisoner?.entryDate || 'N/A'}</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 px-4 py-3 rounded-lg flex-1 md:flex-initial">
          <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">Release / Transfer Date</span>
          <span className="text-sm font-mono text-amber-300 font-semibold">{prisoner?.releaseDate || 'Ongoing Custody'}</span>
        </div>
      </div>
    </div>
  );
};

export default PrisonerHeader;