import React, { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import PrisonerDetailModal from '../AllPrisoners/PrisonerDetailModal';
import { fetchAllConvictedPrisoners } from '../../api/fetchPrisoners';

// 🛠️ Converts raw Excel floating point dates (e.g. 42465.00011) or raw strings into DD/MM/YYYY
const formatConvictionDate = (rawDate) => {
  if (!rawDate || rawDate === " " || rawDate === "N/A") return "N/A";

  const num = Number(rawDate);
  if (!isNaN(num) && num > 30000 && num < 60000) {
    const parsedDate = new Date(Math.round((num - 25569) * 86400 * 1000));
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return String(rawDate).trim() || "N/A";
};

const AllConvictedPrisonersList = () => {
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

  const parentRef = useRef(null);

  const fetchPrisonersData = async (pageNum, query = '', isNewSearch = false) => {
    if (loading) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllConvictedPrisoners(pageNum, 50, query);
      const newPrisoners = data.prisoners || [];

      if (isNewSearch) {
        setPrisoners(newPrisoners);
      } else {
        setPrisoners((prev) => [...prev, ...newPrisoners]);
      }
      
      setStats({
        totalCount: data.totalCount || 0,
        inCustodyCount: data.inCustodyCount || 0,
        releasedCount: data.releasedCount || 0,
      });
      
      if (pageNum >= data.totalPages || newPrisoners.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error("Failed to fetch convicted prisoners:", err);
      setError("Failed to load convicted prisoner records from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrisonersData(1, '', true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPrisonersData(1, searchQuery, true);
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
      fetchPrisonersData(nextPage, searchQuery, false);
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
      
      {/* ================= HEADER & STATS CARDS ================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-wide">Convicted Prisoners Directory (CT)</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage and inspect registered convicted inmate records & case history</p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search Register No, Name, FIR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition"
            />
          </div>
        </div>

        {/* Server-Side Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400">Total Convicted Records</p>
              <h3 className="text-lg font-bold text-slate-100 font-mono mt-0.5">{stats.totalCount}</h3>
            </div>
            <span className="p-2 bg-slate-800 rounded-lg text-slate-400 text-base">📋</span>
          </div>

          <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase text-amber-400">Convicted In Custody (IN)</p>
              <h3 className="text-lg font-bold text-amber-400 font-mono mt-0.5">{stats.inCustodyCount}</h3>
            </div>
            <span className="p-2 bg-amber-950/50 border border-amber-900/60 rounded-lg text-amber-400 text-base">🔒</span>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase text-emerald-400">Convicted Released (OUT)</p>
              <h3 className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{stats.releasedCount}</h3>
            </div>
            <span className="p-2 bg-emerald-950/50 border border-emerald-900/60 rounded-lg text-emerald-400 text-base">🔓</span>
          </div>
        </div>
      </div>

      {/* ================= DIRECTORY TABLE ================= */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
          <thead className="bg-slate-900/90 text-xs font-mono uppercase text-slate-400 tracking-wider">
            <tr>
              <th className="w-1/6 px-6 py-3.5">Register No</th>
              <th className="w-1/4 px-6 py-3.5">Prisoner Name / Father</th>
              <th className="w-1/6 px-6 py-3.5">Conviction Date</th>
              <th className="w-1/12 px-6 py-3.5">Barrack</th>
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
              <svg className="animate-spin -ml-1 mr-3 h-5 text-amber-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Loading convicted inmate records...
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-400 text-sm font-mono">
              {error}
            </div>
          ) : prisoners.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm font-mono">
              No matching convicted prisoner records found.
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

                const isReleased = prisoner['Release Date'] && String(prisoner['Release Date']).trim() !== "" && String(prisoner['Release Date']).trim() !== " ";
                const rawDate = prisoner['First Admission Date'] || prisoner['Latest Admission Date'] || prisoner['FIR Date'];
                const convictionDate = formatConvictionDate(rawDate);

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
                    {/* Register No Cell */}
                    <div className="w-1/6 font-mono font-medium text-amber-400 truncate pr-2">
                      {prisoner.RegisterNo && String(prisoner.RegisterNo).trim() !== "" ? prisoner.RegisterNo : 'N/A'}
                    </div>

                    {/* Name / Father Cell */}
                    <div className="w-1/4 pr-2 flex flex-col justify-center">
                      <span className="font-medium text-slate-200 truncate">
                        {prisoner['Prisoner Name'] || 'Unknown'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono truncate">
                        S/O: {prisoner['Father Name'] || 'N/A'}
                      </span>
                    </div>

                    {/* 📅 Conviction / Admission Date Cell (Properly Formatted) */}
                    <div className="w-1/6 font-mono text-xs text-amber-400 font-semibold truncate pr-2">
                      {convictionDate}
                    </div>

                    {/* Barrack Cell */}
                    <div className="w-1/12 font-mono text-slate-400 truncate pr-2">
                      {prisoner.Barrack && String(prisoner.Barrack).trim() !== "" ? prisoner.Barrack : 'N/A'}
                    </div>

                    {/* Custody Status Cell */}
                    <div className="w-1/6 pr-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          !isReleased 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {!isReleased ? '🔒 IN CUSTODY' : '🔓 RELEASED'}
                      </span>
                    </div>

                    {/* Action Button Cell */}
                    <div className="w-1/6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPrisoner(prisoner);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600/10 border border-amber-600/30 hover:bg-amber-600 text-amber-400 hover:text-white text-xs font-medium transition cursor-pointer"
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

export default AllConvictedPrisonersList;