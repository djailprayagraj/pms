import React, { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import PrisonerDetailModal from './PrisonerDetailModal';
import { fetchAllPrisoners } from '../../api/fetchPrisoners';

const AllPrisonersList = () => {
  const [prisoners, setPrisoners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalCount: 0,
    inCustodyCount: 0,
    releasedCount: 0,
  });

  const [selectedPrisoner, setSelectedPrisoner] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const parentRef = useRef(null);

  const fetchPrisonersData = async (pageNum, query = '', status = 'all', isNewSearch = false) => {
    if (loading) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllPrisoners(pageNum, 50, query, status);
      const newPrisoners = data.prisoners || [];

      if (isNewSearch) {
        setPrisoners(newPrisoners);
        setStats({
          totalCount: data.totalCount || 0,
          inCustodyCount: data.inCustodyCount || 0,
          releasedCount: data.releasedCount || 0,
        });
      } else {
        setPrisoners((prev) => [...prev, ...newPrisoners]);
      }
      
      if (pageNum >= data.totalPages || newPrisoners.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error("Failed to fetch prisoners:", err);
      setError("Failed to load prisoner records from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPrisonersData(1, searchQuery, statusFilter, true);
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPrisonersData(1, searchQuery, statusFilter, true);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const rowVirtualizer = useVirtualizer({
    count: prisoners.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 62,
    overscan: 10,
  });

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 100 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPrisonersData(nextPage, searchQuery, statusFilter, false);
    }
  };

  const handleUpdateRecord = (updatedRecord) => {
    setPrisoners((prev) =>
      prev.map((p) => (p._id === updatedRecord._id ? updatedRecord : p))
    );
    setSelectedPrisoner(updatedRecord);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-wide">All Prisoners Directory</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage and inspect registered inmate records & case history</p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search Register No, Name, FIR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition"
            />
          </div>
        </div>

        {/* Filter Tabs / Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
              statusFilter === 'all' 
                ? 'bg-slate-100 text-slate-950 shadow' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Records
          </button>
          <button
            onClick={() => setStatusFilter('incustody')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
              statusFilter === 'incustody' 
                ? 'bg-red-600 text-white shadow' 
                : 'bg-slate-900 border border-slate-800 text-red-400 hover:bg-red-950/30'
            }`}
          >
            🔒 In Custody ({stats.inCustodyCount})
          </button>
          <button
            onClick={() => setStatusFilter('released')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
              statusFilter === 'released' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-emerald-950/30'
            }`}
          >
            🔓 Released ({stats.releasedCount})
          </button>
          <button
            onClick={() => setStatusFilter('transferred')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
              statusFilter === 'transferred' 
                ? 'bg-amber-600 text-white shadow' 
                : 'bg-slate-900 border border-slate-800 text-amber-400 hover:bg-amber-950/30'
            }`}
          >
            🔄 Transferred
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
          <thead className="bg-slate-900/90 text-xs font-mono uppercase text-slate-400 tracking-wider">
            <tr>
              <th className="w-1/6 px-6 py-3.5">Register No</th>
              <th className="w-1/4 px-6 py-3.5">Prisoner Name / Father</th>
              <th className="w-1/6 px-6 py-3.5">Age</th>
              <th className="w-1/6 px-6 py-3.5">Barrack</th>
              <th className="w-1/6 px-6 py-3.5">Custody Status</th>
              <th className="w-1/6 px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
        </table>

        <div 
          ref={parentRef} 
          onScroll={handleScroll}
          className="max-h-[600px] overflow-y-auto relative divide-y divide-slate-800/60 bg-slate-950/20"
        >
          {prisoners.length === 0 && loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 font-mono text-sm">
              <svg className="animate-spin -ml-1 mr-3 h-5 text-red-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Loading inmate records...
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-400 text-sm font-mono">
              {error}
            </div>
          ) : prisoners.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm font-mono">
              No matching prisoner records found for this filter.
            </div>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const prisoner = prisoners[virtualRow.index];
                if (!prisoner) return null;

                const isInCustody = prisoner.location === 'IN';

                return (
                  <div
                    key={prisoner._id || virtualRow.index}
                    onClick={() => setSelectedPrisoner(prisoner)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="flex items-center px-6 hover:bg-slate-800/40 transition-colors group cursor-pointer border-b border-slate-800/40"
                  >
                    <div className="w-1/6 font-mono font-medium text-red-400 truncate pr-2">
                      {prisoner.RegisterNo || 'N/A'}
                    </div>

                    <div className="w-1/4 pr-2 flex flex-col justify-center">
                      <span className="font-medium text-slate-200 truncate">
                        {prisoner['Prisoner Name'] || 'Unknown'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono truncate">
                        S/O: {prisoner['Father Name'] || 'N/A'}
                      </span>
                    </div>

                    <div className="w-1/6 text-slate-400 truncate pr-2">
                      {prisoner.Age || 'N/A'}
                    </div>

                    <div className="w-1/6 font-mono text-slate-400 truncate pr-2">
                      {prisoner.Barrack || 'N/A'}
                    </div>

                    <div className="w-1/6 pr-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          isInCustody 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {isInCustody ? '🔒 IN CUSTODY' : '🔓 RELEASED'}
                      </span>
                    </div>

                    <div className="w-1/6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPrisoner(prisoner);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600/10 border border-red-600/30 hover:bg-red-600 text-red-400 hover:text-white text-xs font-medium transition cursor-pointer"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {loading && prisoners.length > 0 && (
            <div className="py-4 text-center font-mono text-xs text-slate-500">
              Loading more records...
            </div>
          )}
        </div>
      </div>

      <PrisonerDetailModal
        prisoner={selectedPrisoner}
        onClose={() => setSelectedPrisoner(null)}
        onUpdatePrisoner={handleUpdateRecord}
      />
    </div>
  );
};

export default AllPrisonersList;