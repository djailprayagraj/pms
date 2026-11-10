import React from 'react';

const RecordsTable = ({
  records,
  selectedIds,
  onSelectAll,
  onToggleSelect,
  modifiedRows,
  onInlineChange,
  onSaveRow,
  onEditRow,
  onDeleteRow,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-3 p-4">
      <div className="flex justify-between items-center text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
        <span>Adalat Logs Database View</span>
        <span className="text-slate-500">
          Edit fields inline and click <span className="text-emerald-400 font-bold">Save</span> to sync modifications.
        </span>
      </div>

      <div className="max-h-[500px] overflow-y-auto overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono shadow-md">
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={records.length > 0 && selectedIds.length === records.length}
                  onChange={onSelectAll}
                  className="accent-red-500 rounded cursor-pointer"
                />
              </th>
              <th className="p-3">UT No.</th>
              <th className="p-3">Prisoner & Father Name</th>
              <th className="p-3">FIR / Sections</th>
              <th className="p-3">Court Name</th>
              <th className="p-3">Warrant Type</th>
              <th className="p-3">Mode</th>
              <th className="p-3">Custody Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {records.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-slate-500">
                  No matching records found.
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const recordId = record._id || record.id;
                const isSelected = selectedIds.includes(recordId);
                const edits = modifiedRows[recordId] || {};
                const isModified = Object.keys(edits).length > 0;

                return (
                  <tr
                    key={recordId}
                    className={`hover:bg-slate-800/40 transition ${isSelected ? 'bg-slate-800/60' : ''}`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(recordId)}
                        className="accent-red-500 rounded cursor-pointer"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="text"
                        value={edits.utNumber !== undefined ? edits.utNumber : record.utNumber || ''}
                        onChange={(e) => onInlineChange(recordId, 'utNumber', e.target.value)}
                        className="bg-slate-950/80 border border-slate-700/60 focus:border-red-500 text-red-400 font-bold px-2 py-1 rounded w-24 text-xs"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="text"
                        value={edits.prisonerName !== undefined ? edits.prisonerName : record.prisonerName || ''}
                        onChange={(e) => onInlineChange(recordId, 'prisonerName', e.target.value)}
                        className="bg-slate-950/80 border border-slate-700/60 focus:border-red-500 text-white font-semibold px-2 py-1 rounded w-36 text-xs block mb-1"
                      />
                      <input
                        type="text"
                        value={edits.fatherName !== undefined ? edits.fatherName : record.fatherName || ''}
                        onChange={(e) => onInlineChange(recordId, 'fatherName', e.target.value)}
                        className="bg-slate-950/80 border border-slate-700/60 focus:border-red-500 text-slate-400 px-2 py-0.5 rounded w-36 text-[11px]"
                        placeholder="Father Name"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="text"
                        value={edits.firNumber !== undefined ? edits.firNumber : record.firNumber || ''}
                        onChange={(e) => onInlineChange(recordId, 'firNumber', e.target.value)}
                        className="bg-slate-950/80 border border-slate-700/60 focus:border-red-500 text-amber-300 font-bold px-2 py-1 rounded w-28 text-xs block mb-1"
                      />
                      <input
                        type="text"
                        value={edits.actSection !== undefined ? edits.actSection : record.actSection || ''}
                        onChange={(e) => onInlineChange(recordId, 'actSection', e.target.value)}
                        className="bg-slate-950/80 border border-slate-700/60 focus:border-red-500 text-slate-400 px-2 py-0.5 rounded w-28 text-[11px]"
                        placeholder="Sections"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="text"
                        value={edits.courtName !== undefined ? edits.courtName : record.courtName || ''}
                        onChange={(e) => onInlineChange(recordId, 'courtName', e.target.value)}
                        className="bg-slate-950/80 border border-slate-700/60 focus:border-red-500 text-slate-200 px-2 py-1 rounded w-44 text-xs"
                      />
                    </td>

                    <td className="p-3">
                      <select
                        value={edits.warrantType !== undefined ? edits.warrantType : record.warrantType || '167/187'}
                        onChange={(e) => onInlineChange(recordId, 'warrantType', e.target.value)}
                        className="bg-slate-950/80 border border-slate-700/60 focus:border-red-500 text-cyan-300 px-1.5 py-1 rounded text-xs block mb-1 cursor-pointer"
                      >
                        <option value="167/187">167/187</option>
                        <option value="209/232">209/232</option>
                        <option value="309/346">309/346</option>
                      </select>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span>Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={edits.warrantCount !== undefined ? edits.warrantCount : record.warrantCount || 1}
                          onChange={(e) => onInlineChange(recordId, 'warrantCount', parseInt(e.target.value, 10) || 1)}
                          className="bg-slate-950 border border-slate-700 w-12 text-center text-amber-300 rounded py-0.5"
                        />
                      </div>
                    </td>

                    <td className="p-3">
                      <select
                        value={edits.appearanceMode !== undefined ? edits.appearanceMode : record.appearanceMode || 'VC'}
                        onChange={(e) => onInlineChange(recordId, 'appearanceMode', e.target.value)}
                        className="bg-slate-950/80 border border-slate-700/60 focus:border-red-500 text-indigo-300 px-1.5 py-1 rounded text-xs cursor-pointer"
                      >
                        <option value="VC">VC</option>
                        <option value="SESSION_ADALAT">SESSION_ADALAT</option>
                      </select>
                    </td>

                    <td className="p-3">
                      <select
                        value={edits.custodyStatus !== undefined ? edits.custodyStatus : record.custodyStatus || 'ACTIVE_CUSTODY'}
                        onChange={(e) => onInlineChange(recordId, 'custodyStatus', e.target.value)}
                        className={`border border-slate-700/60 px-1.5 py-1 rounded text-xs font-bold cursor-pointer ${
                          (edits.custodyStatus || record.custodyStatus) === 'RIHA'
                            ? 'bg-amber-950/80 text-amber-400 border-amber-700'
                            : 'bg-emerald-950/80 text-emerald-400 border-emerald-700'
                        }`}
                      >
                        <option value="ACTIVE_CUSTODY">ACTIVE CUSTODY</option>
                        <option value="RIHA">RIHA</option>
                      </select>
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isModified && (
                          <button
                            type="button"
                            onClick={() => onSaveRow(record)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2 py-1 rounded transition shadow cursor-pointer"
                            title="Save Changes"
                          >
                            Save
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditRow(record)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2 py-1 rounded transition border border-slate-700 cursor-pointer"
                          title="Full Edit"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRow(recordId, record.utNumber)}
                          className="bg-red-950/80 hover:bg-red-900 text-red-300 text-[11px] px-2 py-1 rounded transition border border-red-800 cursor-pointer"
                          title="Delete Entry"
                        >
                          Del
                        </button>
                      </div>
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

export default RecordsTable;