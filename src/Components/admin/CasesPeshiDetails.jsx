import React from 'react';

export default function CasesPeshiDetails({ prisoner, onClose }) {
  if (!prisoner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>📑</span> Case & Production Details Breakdown
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Prisoner: <strong className="text-red-400">{prisoner.name}</strong> ({prisoner.utNumber}) | Barrack/Ward: <strong className="text-slate-200">{prisoner.wardNo}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-100">
          
          {/* General Prisoner Info Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Police Station:</span>
              <span className="text-slate-200 font-medium">{prisoner.policeStation}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Assigned Barrack / Ward:</span>
              <span className="text-red-400 font-bold">{prisoner.wardNo}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Primary Custody Status:</span>
              <span className="text-emerald-400 font-medium">{prisoner.custodyStatus}</span>
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider">
              Registered Cases & Warrant Statistics ({prisoner.cases.length})
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {prisoner.cases.map((c, index) => (
                <div key={index} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition">
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500">Case / Crime No.</span>
                      <h5 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                        <span>{c.caseNo}</span>
                        <span className="text-xs text-slate-400 font-normal">({c.firNo})</span>
                      </h5>
                    </div>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-md border font-semibold ${c.statusBg}`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-mono block">Court Name:</span>
                      <span className="text-slate-200 font-medium">{c.courtName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono block">Sections Applied:</span>
                      <span className="text-red-400 font-mono font-semibold">{c.sections}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono block">Active Warrant Type:</span>
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded font-mono text-[11px] inline-block mt-0.5">
                        {c.warrantType || 'Sec 309 CrPC / 346 BNSS'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono block">Release / Bail Date (Rihai):</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {c.rihaiDate || (c.status.includes('Bail') ? 'Granted (15 Sep 2024)' : 'Under Trial (Pending)')}
                      </span>
                    </div>
                  </div>

                  {/* Case Specific Production Stats */}
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 flex flex-wrap justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Production Summary in this case:</span>
                    <div className="flex gap-4">
                      <span>Total Hearings: <strong className="text-white">5</strong></span>
                      <span>VC: <strong className="text-emerald-400">3</strong></span>
                      <span>Physical: <strong className="text-amber-400">2</strong></span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 text-white font-mono text-xs px-5 py-2 rounded-xl transition cursor-pointer shadow"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
}