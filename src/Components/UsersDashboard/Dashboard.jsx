import React, { useState } from 'react';

import DashboardHeader from './DashboardHeader';
import DashboardWorkingArea from './DashboardWorkingArea/DashboadWorkingArea';
import ImportEprisonData from '../ImportData/ImportEprisonData';
import WarrantWiseListAdalat from './DashboardWorkingArea/WarrantWiseListAdalat';

// Accept onLogout as a prop from App.jsx
const Dashboard = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Active Navigation Tab State: 'dashboard' | 'warrant-list' | 'import-eprison' | 'peshi' | 'cells'
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* ================= NAVBAR ================= */}
      <DashboardHeader />

      {/* ================= MAIN LAYOUT (SIDENAV + CONTENT) ================= */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDENAV */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-20`}>
          <div className="p-4 space-y-1 flex-1">
            
            {/* 1. Dashboard Tab */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-red-600/10 border border-red-600/30 text-red-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              {sidebarOpen && <span>Dashboard</span>}
            </button>

            {/* 2. Warrant Type List Tab */}
            <button
              onClick={() => setActiveTab('warrant-list')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'warrant-list'
                  ? 'bg-red-600/10 border border-red-600/30 text-red-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {sidebarOpen && <span>Warrant Type List</span>}
            </button>

            {/* 3. Import ePrisons Data Tab */}
            <button
              onClick={() => setActiveTab('import-eprison')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'import-eprison'
                  ? 'bg-red-600/10 border border-red-600/30 text-red-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              {sidebarOpen && <span>Import ePrisons</span>}
            </button>

            {/* 4. Court Peshi Schedule */}
            <button
              onClick={() => setActiveTab('peshi')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'peshi'
                  ? 'bg-red-600/10 border border-red-600/30 text-red-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {sidebarOpen && <span>Court Peshi Schedule</span>}
            </button>

            {/* 5. Cells & Blocks */}
            <button
              onClick={() => setActiveTab('cells')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'cells'
                  ? 'bg-red-600/10 border border-red-600/30 text-red-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
              {sidebarOpen && <span>Cells & Blocks</span>}
            </button>

          </div>

          <div className="p-4 border-t border-slate-800">
            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition border border-red-700/50 shadow-md shadow-red-950/50 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              {sidebarOpen && <span>Secure Logout</span>}
            </button>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col justify-between">

          {/* Dynamic Component Rendering */}
          {activeTab === 'dashboard' && <DashboardWorkingArea />}

          {activeTab === 'import-eprison' && (
            <ImportEprisonData onUploadSuccess={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'warrant-list' && (
            <WarrantWiseListAdalat />
          )}

          {activeTab !== 'dashboard' && activeTab !== 'import-eprison' && activeTab !== 'warrant-list' && (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/30">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-slate-400 text-xl">
                ⛓️
              </div>
              <h3 className="text-base font-semibold text-slate-300 uppercase tracking-wider font-mono">
                {activeTab.replace('-', ' ')} Section
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Module view ready for integration. Select "Dashboard" or "Import ePrisons" to view active modules.
              </p>
            </div>
          )}

          <footer className="mt-12 text-center text-xs text-slate-600 font-mono">
            District Jail Prayagraj Administration System • Authorized Access Only
          </footer>
          
        </main>
      </div>

    </div>
  );
};

export default Dashboard;