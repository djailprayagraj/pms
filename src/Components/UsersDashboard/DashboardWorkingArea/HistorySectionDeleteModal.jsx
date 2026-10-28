import React from 'react';

const HistorySectionDeleteModal = ({ isOpen, record, isDeleting, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 shrink-0 text-lg">
            ⚠️
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Confirm Deletion</h4>
            <p className="text-xs text-slate-400">This action will permanently delete the record from the database.</p>
          </div>
        </div>

        {record && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono space-y-1">
            <p><span className="text-slate-500">UT Code:</span> <span className="text-red-400 font-bold">{record.ut_code}</span></p>
            <p><span className="text-slate-500">Prisoner:</span> <span className="text-white font-bold">{record.full_name}</span></p>
            <p><span className="text-slate-500">FIR No:</span> <span className="text-slate-300">{record.fir_number}</span></p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition cursor-pointer shadow flex items-center gap-1.5"
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistorySectionDeleteModal;