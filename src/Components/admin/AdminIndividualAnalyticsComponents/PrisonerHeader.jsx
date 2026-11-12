import React from 'react';

export default function PrisonerHeader({ selectedProfile, onOpenCasesModal, casesCount }) {
  const name = selectedProfile?.prisonerName || 'Unknown Prisoner';
  const avatarInitials = name !== 'Unknown Prisoner' ? name.split(' ').map(n => n?.[0] || '').join('').toUpperCase() : 'TP';
  const fatherName = selectedProfile?.fatherName || 'N/A';
  const registerNo = selectedProfile?.utNumbers?.[0] || 'N/A';
  const wardNo = selectedProfile?.barrack || 'Unassigned';
  const policeStation = selectedProfile?.district || 'N/A';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-red-600/50 flex items-center justify-center text-xl font-bold text-slate-200">
          {avatarInitials}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white capitalize">{name}</h3>
          <p className="text-xs text-slate-400 mt-1">Father's Name: <span className="text-slate-200 capitalize">{fatherName}</span></p>
          <div className="flex flex-wrap gap-x-4 text-xs text-slate-400 mt-2 font-mono">
            <span>UT No: <strong className="text-red-400">{registerNo}</strong></span>
            <span>•</span>
            <span>Barrack: <strong className="text-slate-200">{wardNo}</strong></span>
            <span>•</span>
            <span>District: <strong className="text-slate-200">{policeStation}</strong></span>
          </div>
        </div>
      </div>
      <button
        onClick={onOpenCasesModal}
        className="bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-300 px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
      >
        📑 Inspect Active Cases ({casesCount})
      </button>
    </div>
  );
}