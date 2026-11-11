import React from 'react';

const AdalatHistory = ({ adalatLogs = [] }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>
          Adalat Appearance & Summon History
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Mode</th>
              <th className="py-3 px-4">Case / FIR</th>
              <th className="py-3 px-4">Summon Purpose</th>
              <th className="py-3 px-4">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-xs">
            {adalatLogs.map((log, index) => (
              <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 text-indigo-300 font-medium">{log.date}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-sans font-semibold ${
                    log.mode === 'VC' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {log.mode}
                  </span>
                </td>
                <td className="py-3 px-4">{log.firNo}</td>
                <td className="py-3 px-4 text-slate-400">{log.purpose}</td>
                <td className="py-3 px-4 text-slate-200">{log.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdalatHistory;