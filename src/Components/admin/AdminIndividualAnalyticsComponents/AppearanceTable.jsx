import React from 'react';

export default function AppearanceTable({
  filteredHistory,
  totalHistoryCount,
  tableSearchText,
  setTableSearchText,
  filterMode,
  setFilterMode,
  filterWarrant,
  setFilterWarrant,
  filterCourt,
  setFilterCourt,
  uniqueCourts,
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-4">
      <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Appearance Audit Trail ({filteredHistory.length} of {totalHistoryCount} records shown)
          </h4>
        </div>

        {/* Instant Frontend Filters & Search Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            value={tableSearchText}
            onChange={(e) => setTableSearchText(e.target.value)}
            placeholder="Filter table rows..."
            className="bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-red-500 w-44"
          />

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-red-500"
          >
            <option value="ALL">Mode: All</option>
            <option value="VC">VC Only</option>
            <option value="PHYSICAL">Physical Only</option>
          </select>

          <select
            value={filterWarrant}
            onChange={(e) => setFilterWarrant(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-red-500"
          >
            <option value="ALL">Warrant: All</option>
            <option value="167">167/187</option>
            <option value="209">209/232</option>
            <option value="309">309/346</option>
          </select>

          <select
            value={filterCourt}
            onChange={(e) => setFilterCourt(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-red-500 max-w-[160px]"
          >
            <option value="ALL">Court: All</option>
            {uniqueCourts.map((court, i) => (
              <option key={i} value={court}>{court}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-left text-xs text-slate-300 font-sans">
          <thead className="bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-3.5">First Date</th>
              <th className="p-3.5">Mode of Production</th>
              <th className="p-3.5">Warrant Type</th>
              <th className="p-3.5">Court Name</th>
              <th className="p-3.5">FIR Number</th>
              <th className="p-3.5">Custody Status</th>
              <th className="p-3.5">Custody Date</th>
              <th className="p-3.5 text-right">RIHA Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-10 text-center text-slate-500 text-xs">
                  No production logs match your filter/search criteria.
                </td>
              </tr>
            ) : (
              filteredHistory.map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 text-white font-bold">
                    {item.hearingDate ? new Date(item.hearingDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${item.appearanceMode === 'VC' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'}`}>
                      {item.appearanceMode || 'PHYSICAL'}
                    </span>
                  </td>
                  <td className="p-3.5 text-amber-300">{item.warrantType || 'N/A'}</td>
                  <td className="p-3.5 text-slate-200">{item.courtName || 'District Court'}</td>
                  <td className="p-3.5 text-slate-400">{item.firNumber || 'N/A'}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.custodyStatus === 'ACTIVE_CUSTODY' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {item.custodyStatus || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    {item.custodyDate ? new Date(item.custodyDate).toLocaleDateString() : (item.hearingDate ? new Date(item.hearingDate).toLocaleDateString() : 'N/A')}
                  </td>
                  <td className="p-3.5 text-right text-emerald-400">
                    {item.rihaDate ? new Date(item.rihaDate).toLocaleDateString() : 'Active'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}