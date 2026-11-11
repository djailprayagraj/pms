import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrisonerHeader from './PrisonerHeader';
import FIRSectionTracker from './FIRSectionTracker';
import AdalatHistory from './AdalatHistory';
import SectionAuditTrail from './SectionAuditTrail';

const PrisonerHistory = () => {
  const { utNumber } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [prisonerData, setPrisonerData] = useState(null);

  useEffect(() => {
    const fetchPrisonerDetails = async () => {
      setLoading(true);
      try {
        // Replace with your real backend endpoint: `/api/prisoners/history/${utNumber}`
        setTimeout(() => {
          setPrisonerData({
            name: "Rajesh Kumar",
            avatarInitials: "RK",
            status: "Active Custody",
            jailName: "Central District Jail - Block C",
            entryDate: "2025-11-10",
            releaseDate: "Ongoing",
            firRecords: [
              {
                firNo: "FIR-452/2025",
                policeStation: "Civil Lines PS",
                activeSections: ["302 IPC", "34 IPC", "27 Arms Act"],
                releasedSections: [
                  { section: "324 IPC", date: "2025-12-01" }
                ]
              }
            ],
            adalatLogs: [
              { date: "2026-02-15", mode: "VC", firNo: "FIR-452/2025", purpose: "Remand Extension", outcome: "Extended by 14 Days" },
              { date: "2026-01-10", mode: "Physical", firNo: "FIR-452/2025", purpose: "Bail Hearing", outcome: "Rejected" }
            ],
            auditLogs: [
              { action: "ADDED", section: "27 Arms Act", firNo: "FIR-452/2025", reason: "Weapon recovered during forensic search", modifiedBy: "Officer M. Singh (Admin)", timestamp: "2025-11-12 14:30" },
              { action: "REMOVED", section: "324 IPC", firNo: "FIR-452/2025", reason: "Dropped by public prosecutor review", modifiedBy: "Judge Sharma (Court Auth)", timestamp: "2025-12-01 10:15" }
            ]
          });
          setLoading(false);
        }, 400);
      } catch (err) {
        console.error("Failed to load data", err);
        setLoading(false);
      }
    };

    if (utNumber) fetchPrisonerDetails();
  }, [utNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center font-sans">
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-lg shadow-xl">
          <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Loading records for UT: <span className="text-white font-mono">{utNumber}</span>...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Breadcrumb Navigation & Close Button */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center text-xs md:text-sm text-slate-400 space-x-2 bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-lg backdrop-blur-sm">
            <button 
              onClick={() => navigate('/dashboard')}
              className="hover:text-indigo-400 transition-colors flex items-center gap-1 font-medium"
            >
              Dashboard
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">Prisoner Management</span>
            <span className="text-slate-600">/</span>
            <span className="text-indigo-300 font-mono font-medium">{utNumber}</span>
          </nav>

          <button
            onClick={() => window.close()}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white px-3.5 py-2 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-2"
          >
            <span>Close Tab</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 1. Prisoner Header Component */}
        <PrisonerHeader prisoner={prisonerData} utNumber={utNumber} />

        {/* 2. FIR & Sections Tracker Component */}
        <FIRSectionTracker firRecords={prisonerData?.firRecords} />

        {/* 3. Adalat History Component */}
        <AdalatHistory adalatLogs={prisonerData?.adalatLogs} />

        {/* 4. Section Modification Audit Trail Component */}
        <SectionAuditTrail auditLogs={prisonerData?.auditLogs} />

      </div>
    </div>
  );
};

export default PrisonerHistory;