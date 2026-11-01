import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setDashboardViewMode } from '../../redux/slices/adminDashboardSlice';
import { logoutUser } from '../../api/authService';

export default function AdminDashboardNavbar({ onLogout }) {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.adminDashboard.activeTab);
  const dashboardViewMode = useSelector((state) => state.adminDashboard.dashboardViewMode);

  const handleLogoutClick = () => {
    logoutUser();
    if (onLogout) onLogout();
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 grid grid-cols-3 items-center shadow-lg sticky top-0 z-20">
      {/* 1. Left: Brand / Title */}
      <div className="flex items-center space-x-3 justify-start">
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

      {/* 2. Center: Perfectly Centered View Mode Switcher */}
      <div className="flex justify-center">
        {activeTab === 'dashboard' && (
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 shadow-inner">
            <button
              onClick={() => dispatch(setDashboardViewMode('group'))}
              className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all duration-150 cursor-pointer ${
                dashboardViewMode === 'group'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              👥 Group Analytics
            </button>
            <button
              onClick={() => dispatch(setDashboardViewMode('individual'))}
              className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all duration-150 cursor-pointer ${
                dashboardViewMode === 'individual'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              🔍 Individual Prisoner Search
            </button>
          </div>
        )}
      </div>

      {/* 3. Right: Logout Action */}
      <div className="flex justify-end">
        <button
          onClick={handleLogoutClick}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono px-3.5 py-2 rounded-lg border border-slate-700 transition cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
}