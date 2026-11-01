import React from 'react';

const HistorySectionTable = ({
  groupedPrisonerRecords,
  isLoadingDb,
  selectedDate,
  setDeleteModal,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80 shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
              <th className="p-3 text-center w-12">S.No</th>
              <th className="p-3">UT Code</th>
              <th className="p-3">Prisoner Name & Father Name</th>
              <th className="p-3">Consolidated Cases, Courts & Warrant Types</th>
              <th className="p-3">Execution Date</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {groupedPrisonerRecords.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500 italic">
                  {isLoadingDb ? 'Loading records from database...' : `No records found for date: ${selectedDate}.`}
                </td>
              </tr>
            ) : (
              groupedPrisonerRecords.map((inmateGroup, index) => (
                <tr key={inmateGroup.ut_code || index} className="transition hover:bg-slate-800/40 align-top">
                  <td className="p-3 text-center font-bold text-slate-400">{index + 1}</td>
                  <td className="p-3 text-red-400 font-bold whitespace-nowrap">{inmateGroup.ut_code}</td>
                  <td className="p-3 text-white font-sans">
                    {/* Added break-words whitespace-normal to prevent truncation with ... */}
                    <div className="font-bold text-sm text-slate-100 break-words whitespace-normal">{inmateGroup.full_name}</div>
                    <div className="text-xs text-slate-400 mt-0.5 break-words whitespace-normal">S/o: {inmateGroup.father_name}</div>
                    <div className="text-[10px] text-indigo-400 mt-1 font-mono">Barrack: {inmateGroup.barrack}</div>
                  </td>
                  <td className="p-3 space-y-2">
                    {inmateGroup.cases.map((c, cIdx) => (
                      <div key={c.id || cIdx} className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 border border-slate-800 p-2 rounded-lg">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-red-400 font-bold bg-red-950/40 px-2 py-0.5 rounded border border-red-900/50">FIR: {c.fir_number}</span>
                          <span className="text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/50">{c.legal_provision || '167/187'}</span>
                          <span className="text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/50">🏛️ {c.court_name} ({c.sub_option.toUpperCase()})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeleteModal({ isOpen: true, record: { id: c.id, ut_code: inmateGroup.ut_code, full_name: inmateGroup.full_name, fir_number: c.fir_number } })}
                          className="bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 px-2 py-1 rounded text-[10px]"
                        >
                          🗑️ Delete Case
                        </button>
                      </div>
                    ))}
                  </td>
                  <td className="p-3 text-emerald-400 whitespace-nowrap">{inmateGroup.hearing_date}</td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded text-[10px] font-bold font-mono inline-block">
                      ✓ SAVED ({inmateGroup.cases.length} {inmateGroup.cases.length === 1 ? 'Case' : 'Cases'})
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorySectionTable;