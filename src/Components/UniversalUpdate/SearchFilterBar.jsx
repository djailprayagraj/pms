import React from 'react';

const SearchFilterBar = ({
  activeTab,
  setActiveTab,
  searchUt,
  setSearchUt,
  searchFir,
  setSearchFir,
  searchDate,
  setSearchDate,
  onSearch,
  loading,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <div className="flex border-b border-slate-800 gap-2 text-[11px] font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('ut')}
          className={`pb-1.5 px-3 border-b-2 font-semibold transition cursor-pointer ${
            activeTab === 'ut' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          By UT No.
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fir')}
          className={`pb-1.5 px-3 border-b-2 font-semibold transition cursor-pointer ${
            activeTab === 'fir' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          By FIR / Crime No.
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('date')}
          className={`pb-1.5 px-3 border-b-2 font-semibold transition cursor-pointer ${
            activeTab === 'date' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          By Hearing Date
        </button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {activeTab === 'ut' && (
          <input
            type="text"
            placeholder="Enter UT (e.g. 3857/26)"
            value={searchUt}
            onChange={(e) => setSearchUt(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-red-500 font-mono"
          />
        )}
        {activeTab === 'fir' && (
          <input
            type="text"
            placeholder="Enter FIR (e.g. 142/26)"
            value={searchFir}
            onChange={(e) => setSearchFir(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-red-500 font-mono"
          />
        )}
        {activeTab === 'date' && (
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-red-500 font-mono"
          />
        )}
        <button
          type="button"
          onClick={onSearch}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition shadow-md whitespace-nowrap cursor-pointer"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  );
};

export default SearchFilterBar;