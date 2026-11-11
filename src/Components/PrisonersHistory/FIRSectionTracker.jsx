import React from 'react';

const FIRSectionTracker = ({ firRecords = [] }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl space-y-4">
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          FIR & Section Custody Breakdown
        </h2>
        <span className="text-xs text-slate-400">Active & Disposed Sections</span>
      </div>

      <div className="space-y-4">
        {firRecords.map((record, index) => (
          <div key={index} className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/50 pb-2">
              <span className="font-mono text-sm font-bold text-indigo-300">FIR No: {record.firNo}</span>
              <span className="text-xs text-slate-400">Police Station: {record.policeStation}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sections under custody */}
              <div className="bg-slate-900/80 border border-emerald-500/20 rounded-md p-3">
                <span className="text-xs font-semibold text-emerald-400 block mb-2">Sections Under Custody</span>
                <div className="flex flex-wrap gap-1.5">
                  {record.activeSections?.map((sec, i) => (
                    <span key={i} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono px-2 py-0.5 rounded">
                      {sec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sections released */}
              <div className="bg-slate-900/80 border border-amber-500/20 rounded-md p-3">
                <span className="text-xs font-semibold text-amber-400 block mb-2">Released / Dropped Sections</span>
                <div className="flex flex-wrap gap-1.5">
                  {record.releasedSections && record.releasedSections.length > 0 ? record.releasedSections.map((sec, i) => (
                    <span key={i} className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono px-2 py-0.5 rounded" title={`Released on: ${sec.date}`}>
                      {sec.section} ({sec.date})
                    </span>
                  )) : <span className="text-xs text-slate-500 italic">No sections released yet</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FIRSectionTracker;