import React from 'react';
import { isFemaleInmate, calculateTotalWarrants } from './helpers';

const WarrantTable = ({ warrantType, appearanceFilter, items, fromDate, toDate }) => {
  const tableDateLabel = fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`;
  const sectionTotalWarrants = calculateTotalWarrants(items);

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80 shadow-xl">
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">📋</span>
          <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
            Warrant Type: {warrantType} ({appearanceFilter})
          </h4>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded">
            📅 Date: <strong className="text-emerald-400">{tableDateLabel}</strong>
          </span>
          <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded text-amber-400 font-bold">
            Warrant Total: {sectionTotalWarrants}
          </span>
          <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded text-emerald-400 font-bold">
            Inmates: {items.length}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-950/60 text-slate-300 border-b border-slate-800 font-mono text-xs">
              <th className="p-3 text-center w-12">S.No</th>
              <th className="p-3">UT Number</th>
              <th className="p-3">Prisoner Name</th>
              <th className="p-3">Father Name</th>
              <th className="p-3 text-center">Barrack</th>
              <th className="p-3 text-center">Warrant Count</th>
              <th className="p-3">FIR No.</th>
              <th className="p-3">Custody Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {items.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-slate-500 italic">
                  No records for warrant type {warrantType}.
                </td>
              </tr>
            ) : (
              items.map((record, index) => {
                const isFemale = isFemaleInmate(record);
                const warrantCountVal = record.warrantCount !== undefined && record.warrantCount !== null ? record.warrantCount : 'N/A';
                return (
                  <tr 
                    key={record._id || index} 
                    className={`transition ${isFemale ? 'bg-pink-950/20 border-l-4 border-l-pink-500' : 'hover:bg-slate-800/40'}`}
                  >
                    <td className="p-3 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="p-3 text-red-400 font-bold">{record.utNumber}</td>
                    <td className="p-3 text-white font-sans font-semibold text-sm flex items-center gap-2">
                      {record.prisonerName}
                      {isFemale && (
                        <span className="bg-pink-950 text-pink-300 border border-pink-800 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          ♀ Female
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-300 font-sans text-sm">{record.fatherName}</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">{record.barrack}</td>
                    <td className="p-3 text-center">
                      <span className="inline-block bg-amber-500/90 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded border border-amber-400 shadow-sm print:bg-transparent print:text-black print:border-none print:shadow-none print:text-sm">
                        {warrantCountVal}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{record.firNumber}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        record.custodyStatus === 'RIHA' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {record.custodyStatus}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarrantTable;