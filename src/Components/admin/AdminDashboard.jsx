import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../redux/slices/adminDashboardSlice'; // Update path as needed
import AddUserPage from './AddUserPage';
import EmployedUsers from './EmployedUsers'; 
import AdminSubDashboard from './AdminIndividualAnalyticsComponents/AdminSubDashboard'; 
import AdminDashboardNavbar from './AdminDashboardNavbar'; 
import AdminSidebar from './AdminSidebar'; 
import AdminSubDashboardGroup from './AdminGroupAnalyticsComponents/AdminSubDashboardGroup'; 

export default function AdminDashboard({ onLogout }) {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.adminDashboard.activeTab);
  const dashboardViewMode = useSelector((state) => state.adminDashboard.dashboardViewMode);

  const navGroups = [
    {
      title: "Management",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
      ],
    },
    {
      title: "Analytics & Reports",
      items: [
        { id: 'revenue', label: 'Revenue', icon: '💰' },
        { id: 'traffic', label: 'Traffic Stats', icon: '📈' },
      ],
    },
    {
      title: "System",
      items: [
        { id: 'settings', label: 'Settings', icon: '⚙️' },
        { id: 'logs', label: 'System Logs', icon: '📋' },
      ],
    },
  ];

  // Flatten navItems helper for checking labels in placeholders
  const allNavItems = navGroups.flatMap((group) => group.items);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10" />

      {/* Top Navbar Component (Now contains the Redux-connected View Switcher) */}
      <AdminDashboardNavbar onLogout={onLogout} />  

      {/* Main Body Container */}
      <div className="flex flex-1 w-full">
        {/* Left Sidebar Component */}
        <AdminSidebar 
          navGroups={navGroups} 
          activeTab={activeTab} 
          setActiveTab={(tab) => dispatch(setActiveTab(tab))} 
        />

        {/* Main Workspace Area */}
        <main className="flex-1 p-6 md:p-8 h-[calc(100vh-65px)] overflow-y-auto">
          {activeTab === 'dashboard' ? (
            <div className="space-y-6">
              {/* Dynamic View Render controlled globally from Navbar */}
              {dashboardViewMode === 'group' ? (
                <AdminSubDashboardGroup />
              ) : (
                <AdminSubDashboard />
              )}
            </div>
          ) : activeTab === 'users' ? (
            <div className="flex">
              <AddUserPage />
            </div>
          ) : activeTab === 'update-user' ? (
            <EmployedUsers />
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/30">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-slate-400 text-xl">
                🧩
              </div>
              <h3 className="text-base font-semibold text-slate-300 uppercase tracking-wider">
                {allNavItems.find((item) => item.id === activeTab)?.label || activeTab} Section
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