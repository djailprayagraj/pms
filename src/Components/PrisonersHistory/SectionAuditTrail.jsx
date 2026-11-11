import React from 'react';

const SectionAuditTrail = ({ auditLogs = [] }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Section Modification & Audit Log
        </h2>
      </div>

      <div className="space-y-3">
        {auditLogs.map((log, index) => (
          <div key={index} className="bg-slate-950/40 border border-slate-800/70 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                  log.action === 'ADDED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {log.action}
                </span>
                <span className="font-mono text-xs text-white font-semibold">Section {log.section}</span>
                <span className="text-xs text-slate-400 font-mono">({log.firNo})</span>
              </div>
              <p className="text-xs text-slate-400">{log.reason}</p>
            </div>
            <div className="text-right sm:text-right font-mono text-[11px] text-slate-400">
              <span className="block text-indigo-300 font-medium">{log.modifiedBy}</span>
              <span>{log.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionAuditTrail;