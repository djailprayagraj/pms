import React from 'react';
import { logoutUser } from '../../api/authService';

export default function AdminDashboardNavbar({ onLogout }) {
  const handleLogoutClick = () => {
    logoutUser();
    if (onLogout) onLogout();
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex justify-between items-center shadow-lg sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-sm shadow">
          DJ
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-wide">
            Admin Control Panel
          </h1>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            District Jail Prayagraj
          </p>
        </div>
      </div>

      <button
        onClick={handleLogoutClick}
        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono px-3.5 py-2 rounded-lg border border-slate-700 transition cursor-pointer"
      >
        Logout
      </button>
    </header>
  );
}