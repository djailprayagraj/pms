import React from 'react';

const HistorySectionFilters = ({
  filterMode,
  setFilterMode,
  genderFilter,
  setGenderFilter,
  counts,
}) => {
  return (
    <div className="px-4 py-2.5 bg-slate-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Type:</span>
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1 rounded-lg border transition ${
            filterMode === 'all' ? 'bg-slate-800 text-white font-bold border-slate-700' : 'text-slate-400 border-slate-800'
          }`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => setFilterMode('session')}
          className={`px-3 py-1 rounded-lg border transition ${
            filterMode === 'session' ? 'bg-amber-950/80 text-amber-300 font-bold border-amber-800' : 'text-slate-400 border-slate-800'
          }`}
        >
          Session Adalat ({counts.session})
        </button>
        <button
          onClick={() => setFilterMode('vc')}
          className={`px-3 py-1 rounded-lg border transition ${
            filterMode === 'vc' ? 'bg-indigo-950/80 text-indigo-300 font-bold border-indigo-800' : 'text-slate-400 border-slate-800'
          }`}
        >
          VC ({counts.vc})
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-400">Gender:</span>
        <button
          onClick={() => setGenderFilter('all')}
          className={`px-3 py-1 rounded-lg border transition ${
            genderFilter === 'all' ? 'bg-slate-800 text-white font-bold border-slate-700' : 'text-slate-400 border-slate-800'
          }`}
        >
          All ({counts.genderAll})
        </button>
        <button
          onClick={() => setGenderFilter('male')}
          className={`px-3 py-1 rounded-lg border transition ${
            genderFilter === 'male' ? 'bg-blue-950/80 text-blue-300 font-bold border-blue-800' : 'text-slate-400 border-slate-800'
          }`}
        >
          👨 Male ({counts.genderMale})
        </button>
        <button
          onClick={() => setGenderFilter('female')}
          className={`px-3 py-1 rounded-lg border transition ${
            genderFilter === 'female' ? 'bg-pink-950/80 text-pink-300 font-bold border-pink-800' : 'text-slate-400 border-slate-800'
          }`}
        >
          👩 Female ({counts.genderFemale})
        </button>
      </div>
    </div>
  );
};

export default HistorySectionFilters;