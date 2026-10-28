import React, { useState, useEffect } from 'react';

const SearchSectionPendingCourt = ({
  isOpen,
  onClose,
  currentCase,
  onSave,
}) => {
  const [courtName, setCourtName] = useState('');
  const [district, setDistrict] = useState('');

  useEffect(() => {
    if (currentCase) {
      setCourtName(currentCase.courtName || '');
      setDistrict(currentCase.district || '');
    }
  }, [currentCase]);

  if (!isOpen || !currentCase) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(currentCase, { courtName, district });
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
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Update Pending Court & District
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

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-slate-300 font-medium text-[11px]">
              Court Name:
            </label>
            <input
              type="text"
              placeholder="Ex. ADJ Court"
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300 font-medium text-[11px]">
              District:
            </label>
            <input
              type="text"
              placeholder="Ex. Prayagraj / Lucknow"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md"
            >
              Save Court Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchSectionPendingCourt;