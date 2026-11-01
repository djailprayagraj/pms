import React, { useState } from 'react';

import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar'; 
import DashboardWorkingArea from './DashboardWorkingArea/DashboadWorkingArea';
import ImportEprisonData from '../ImportData/ImportEprisonData';
import WarrantWiseListAdalat from './DashboardWorkingArea/WarrantWiseListAdalat';
import AllPrisonersList from '../AllPrisoners/AllPrisonersList';
import AllConvictedPrisonersList from '../ConvictedPrisoners/AllConvictedPrisonersList'; // 👈 Imported Convicted component

const Dashboard = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* ================= NAVBAR ================= */}
      <DashboardHeader />

      {/* ================= MAIN LAYOUT (SIDENAV + CONTENT) ================= */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDENAV */}
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={onLogout}
        />

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col justify-between">

          {activeTab === 'dashboard' && <DashboardWorkingArea />}

          {activeTab === 'all-prisoners' && <AllPrisonersList />}

          {/* 🏛️ Render Convicted Prisoners Directory */}
          {activeTab === 'convicted-prisoners' && <AllConvictedPrisonersList />}

          {activeTab === 'import-eprison' && (
            <ImportEprisonData onUploadSuccess={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'warrant-list' && (
            <WarrantWiseListAdalat />
          )}

          {activeTab !== 'dashboard' && 
           activeTab !== 'all-prisoners' && 
           activeTab !== 'convicted-prisoners' && 
           activeTab !== 'import-eprison' && 
           activeTab !== 'warrant-list' && (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/30">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-slate-400 text-xl">
                ⛓️
              </div>
              <h3 className="text-base font-semibold text-slate-300 uppercase tracking-wider font-mono">
                {activeTab.replace('-', ' ')} Section
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Module view ready for integration. Select another tab to view active modules.
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