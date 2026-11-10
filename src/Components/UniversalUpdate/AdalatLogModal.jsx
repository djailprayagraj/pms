import React from 'react';

const AdalatLogModal = ({ isOpen, onClose, editingRecord, formData, setFormData, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h3 className="text-sm font-bold text-white font-mono">
            {editingRecord ? `Edit Log Entry (UT: ${editingRecord.utNumber})` : 'Create New Adalat Log Entry'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-4 overflow-y-auto font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">UT Number *</label>
              <input
                type="text"
                required
                value={formData.utNumber}
                onChange={(e) => setFormData({ ...formData, utNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
                placeholder="3857/26"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">FIR / Crime Number *</label>
              <input
                type="text"
                required
                value={formData.firNumber}
                onChange={(e) => setFormData({ ...formData, firNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
                placeholder="142/26"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Prisoner Name *</label>
              <input
                type="text"
                required
                value={formData.prisonerName}
                onChange={(e) => setFormData({ ...formData, prisonerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Father Name *</label>
              <input
                type="text"
                required
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Court Name *</label>
              <input
                type="text"
                required
                value={formData.courtName}
                onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
                placeholder="ALLAHABAD DISTRICT COURT"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Act / Sections</label>
              <input
                type="text"
                value={formData.actSection}
                onChange={(e) => setFormData({ ...formData, actSection: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
                placeholder="302, 34 IPC"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Warrant Type *</label>
              <select
                value={formData.warrantType}
                onChange={(e) => setFormData({ ...formData, warrantType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 focus:border-red-500 focus:outline-none cursor-pointer"
              >
                <option value="167/187">167/187</option>
                <option value="209/232">209/232</option>
                <option value="309/346">309/346</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Warrant Count</label>
              <input
                type="number"
                min="1"
                value={formData.warrantCount}
                onChange={(e) => setFormData({ ...formData, warrantCount: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Appearance Mode *</label>
              <select
                value={formData.appearanceMode}
                onChange={(e) => setFormData({ ...formData, appearanceMode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 focus:border-red-500 focus:outline-none cursor-pointer"
              >
                <option value="VC">VC</option>
                <option value="SESSION_ADALAT">SESSION_ADALAT</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Custody Status</label>
              <select
                value={formData.custodyStatus}
                onChange={(e) => setFormData({ ...formData, custodyStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 focus:border-red-500 focus:outline-none cursor-pointer"
              >
                <option value="ACTIVE_CUSTODY">ACTIVE_CUSTODY</option>
                <option value="RIHA">RIHA</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Remarks</label>
            <textarea
              rows="2"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
              placeholder="Additional notes..."
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-bold cursor-pointer"
            >
              {editingRecord ? 'Save Changes' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdalatLogModal;