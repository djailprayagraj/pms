import React, { useState } from 'react';
import AddUserPage from './AddUserPage';
import EmployedUsers from './EmployedUsers';
import AdminSubDashboard from './AdminSubDashboard';
import AdminDashboardNavbar from './AdminDashboardNavbar';          // admin Navbar
import AdminSidebar from './AdminSidebar';                          // admin sidebar 
import AdminSubDashboardGroup from './AdminSubDashboardGroup';      // admin sub-dashboard

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard Sub-View Switcher State: 'group' | 'individual'
  const [dashboardViewMode, setDashboardViewMode] = useState('group');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'add-user', label: 'Add User', icon: '👤' },
    { id: 'update-user', label: 'Update User', icon: '✏️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10" />

      {/* Extracted Top Navbar Component */}
      <AdminDashboardNavbar onLogout={onLogout} />

      {/* Main Body Container (Sidebar + Scrollable Main Content Area) */}
      <div className="flex flex-1 w-full">
        {/* Left Sidebar Component (Sticky & Fixed-Height) */}
        <AdminSidebar 
          navItems={navItems} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Main Workspace Area (Only this section scrolls) */}
        <main className="flex-1 p-6 md:p-8 h-[calc(100vh-65px)] overflow-y-auto">
          {activeTab === 'dashboard' ? (
            <div className="space-y-6">
              {/* GUI Mode Selector Bar */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-2 pl-2">
                  <span className="text-xs font-mono text-slate-400 font-medium uppercase tracking-wider">
                    Dashboard View Mode:
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setDashboardViewMode('group')}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition cursor-pointer ${
                      dashboardViewMode === 'group'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    👥 Group Analytics
                  </button>
                  <button
                    onClick={() => setDashboardViewMode('individual')}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition cursor-pointer ${
                      dashboardViewMode === 'individual'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🔍 Individual Prisoner Search
                  </button>
                </div>
              </div>

              {/* Dynamic View Render */}
              {dashboardViewMode === 'group' ? (
                <AdminSubDashboardGroup />
              ) : (
                <AdminSubDashboard />
              )}
            </div>
          ) : activeTab === 'add-user' ? (
            <div className="flex">
              <AddUserPage />
            </div>
          ) : activeTab === 'update-user' ? (
            <EmployedUsers />
          ) : (
            /* Active Tab View Placeholder for other tabs (e.g. Settings) */
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/30">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-slate-400 text-xl">
                🧩
              </div>
              <h3 className="text-base font-semibold text-slate-300 uppercase tracking-wider">
                {navItems.find((item) => item.id === activeTab)?.label} Section
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                This space is ready for your imported sub-components.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}