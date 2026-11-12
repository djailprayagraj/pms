import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export default function ProductionLogTable({ logs, loading, error, serverStats, onLoadMore }) {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 58,
    overscan: 10,
  });

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 120 && !loading) {
      onLoadMore();
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs font-mono text-slate-300">
        <span className="font-bold">Backend Filtered Logs</span>
        <span>VC: <strong className="text-emerald-400 text-sm">{serverStats.vcCount}</strong> | Session: <strong className="text-amber-400 text-sm">{serverStats.sessionCount}</strong></span>
      </div>

      <div className="bg-slate-950 text-slate-300 font-mono text-[11px] font-bold uppercase border-b border-slate-800 grid grid-cols-12 px-4 py-3.5">
        <div className="col-span-3">UT No. & Prisoner</div>
        <div className="col-span-2">FIR / Ward</div>
        <div className="col-span-1">Date</div>
        <div className="col-span-2">Warrant</div>
        <div className="col-span-1">Mode</div>
        <div className="col-span-2">Court Name</div>
        <div className="col-span-1 text-right">Status</div>
      </div>

      <div
        ref={parentRef}
        onScroll={handleScroll}
        className="max-h-[550px] overflow-y-auto relative divide-y divide-slate-800 bg-slate-950/40"
      >
        {logs.length === 0 && loading ? (
          <div className="py-20 text-center text-slate-300 font-mono text-sm font-bold">Loading logs...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-400 font-mono text-sm font-bold">{error}</div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-mono text-sm font-bold">No records found matching criteria.</div>
        ) : (
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const p = logs[virtualRow.index];
              if (!p) return null;

              return (
                <div
                  key={p._id || virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="grid grid-cols-12 items-center px-4 text-xs text-slate-200 hover:bg-slate-800/60 transition border-b border-slate-800/80"
                >
                  <div className="col-span-3 pr-2 truncate">
                    <div className="font-bold text-white text-sm truncate">{p.prisonerName}</div>
                    <span className="font-mono text-[11px] text-red-400 font-semibold">{p.utNumber} • S/O: {p.fatherName}</span>
                  </div>
                  <div className="col-span-2 pr-2 font-mono text-xs truncate">
                    <div className="text-white font-semibold truncate">{p.firNumber || 'N/A'}</div>
                    <span className="text-[11px] text-slate-400">{p.barrack || 'N/A'}</span>
                  </div>
                  <div className="col-span-1 font-mono text-xs text-slate-200 font-semibold">
                    {new Date(p.hearingDate).toLocaleDateString()}
                  </div>
                  <div className="col-span-2">
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-amber-300">
                      {p.warrantType}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${p.appearanceMode === 'VC' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                      {p.appearanceMode}
                    </span>
                  </div>
                  <div className="col-span-2 pr-2 font-bold text-white truncate text-xs">{p.courtName}</div>
                  <div className="col-span-1 text-right">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-black ${p.custodyStatus === 'ACTIVE_CUSTODY' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                      {p.custodyStatus === 'ACTIVE_CUSTODY' ? 'CUSTODY' : 'RIHA'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {loading && logs.length > 0 && <div className="py-4 text-center font-mono text-xs font-bold text-slate-300">Loading more logs...</div>}
      </div>
    </div>
  );
}