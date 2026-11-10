import React from 'react';

const BulkCourtModal = ({
  isOpen,
  onClose,
  targetCourtName,
  setTargetCourtName,
  replacementCourtName,
  setReplacementCourtName,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden font-mono text-xs">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h3 className="text-sm font-bold text-amber-400">Bulk Replace Court Name</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-slate-400 mb-1">Target Court Name (To Find):</label>
            <input
              type="text"
              required
              value={targetCourtName}
              onChange={(e) => setTargetCourtName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-amber-300 rounded px-3 py-1.5 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Replace With:</label>
            <input
              type="text"
              required
              value={replacementCourtName}
              onChange={(e) => setReplacementCourtName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-emerald-400 rounded px-3 py-1.5 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            This operation will update all records across the master dataset matching the target court name.
          </p>
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded cursor-pointer"
            >
              Execute Bulk Replace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkCourtModal;