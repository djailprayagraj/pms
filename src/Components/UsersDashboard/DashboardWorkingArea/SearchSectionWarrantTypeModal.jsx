import React, { useState, useEffect } from 'react';

const WARRANT_OPTIONS = [
  { value: '167/187', label: '167 / 187 CrPC / BNSS' },
  { value: '209/232', label: '209 / 232 CrPC / BNSS' },
  { value: '309/346', label: '309 / 346 CrPC / BNSS' },
];

const SearchSectionWarrantTypeModal = ({
  isOpen,
  onClose,
  currentCase,
  onSave,
}) => {
  const [selectedWarrant, setSelectedWarrant] = useState('167/187');

  // Sync selected state when modal opens or selected case changes
  useEffect(() => {
    if (currentCase?.warrantType) {
      // Pre-select if value matches one of the options
      const match = WARRANT_OPTIONS.find(
        (opt) => opt.value === currentCase.warrantType
      );
      if (match) {
        setSelectedWarrant(match.value);
      } else {
        setSelectedWarrant('167/187');
      }
    }
  }, [currentCase]);

  if (!isOpen || !currentCase) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(currentCase, selectedWarrant);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Update Warrant Provision
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              FIR No: <span className="text-red-400 font-bold">{currentCase.firNo}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-base font-bold px-2 py-0.5 rounded hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Case Context Summary */}
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Police Station:</span>
            <span>{currentCase.psName || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-500">Under Sections:</span>
            <span>{currentCase.actSection || 'N/A'}</span>
          </div>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-medium text-[11px]">
              Select Warrant Type / Legal Provision:
            </label>
            <select
              value={selectedWarrant}
              onChange={(e) => setSelectedWarrant(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500 transition cursor-pointer"
            >
              {WARRANT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-md"
            >
              Save Provision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchSectionWarrantTypeModal;