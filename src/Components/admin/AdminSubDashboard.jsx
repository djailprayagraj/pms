import React, { useState } from 'react';
import CasesPeshiDetails from './CasesPeshiDetails';

// Mock database to demonstrate full functionality. 
const MOCK_PRISONER_DATA = {
  'UT-90142': {
    utNumber: 'UT-90142',
    name: 'Om Prakash',
    fatherName: 'Bhagwat Prashad',
    age: 34,
    gender: 'Male',
    admissionDate: '12 Jan 2024',
    wardNo: 'Ward 4B (High Security)',
    custodyStatus: 'Under Trial',
    policeStation: 'Civil Lines, Prayagraj',
    primaryFir: 'FIR-402/2024',

    // Summary Counts
    stats: {
      totalProductions: 14,
      vcCount: 10,
      inPersonCount: 4,
      totalCases: 3,
      activeCases: 2,
      releasedBailedCases: 1,
      medicalVisits: 3,
      mulaqatVisits: 8
    },

    // Case Details
    cases: [
      {
        caseNo: 'ST/402/2024',
        firNo: 'FIR-402/2024',
        courtName: 'District & Sessions Court, Prayagraj',
        sections: 'IPC 307, 323, 504',
        warrantType: 'Sec 309 CrPC / 346 BNSS (Trial)',
        rihaiDate: 'Pending (Under Trial)',
        status: 'Under Trial',
        statusBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      },
      {
        caseNo: 'ST/118/2023',
        firNo: 'FIR-118/2023',
        courtName: 'Additional Chief Judicial Magistrate, Court No. 3',
        sections: 'IPC 384, 506',
        warrantType: 'Sec 209 CrPC / 239 BNSS (Committal)',
        rihaiDate: '15 Sep 2024 (Bail Granted)',
        status: 'Bail Granted',
        statusBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      },
      {
        caseNo: 'ST/889/2022',
        firNo: 'FIR-889/2022',
        courtName: 'Special Judge SC/ST Act Court',
        sections: 'IPC 147, 148, 149',
        warrantType: 'Sec 309 CrPC / 346 BNSS (Trial)',
        rihaiDate: 'Pending (Under Trial)',
        status: 'Under Trial',
        statusBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      }
    ],

    // Court Production History
    productions: [
      { id: 1, date: '18 Oct 2024', type: 'Virtual (VC)', court: 'District Court, Prayagraj', judge: 'Hon. A.K. Sharma', purpose: 'Charge Framing', status: 'Completed' },
      { id: 2, date: '04 Oct 2024', type: 'Virtual (VC)', court: 'District Court, Prayagraj', judge: 'Hon. A.K. Sharma', purpose: 'Evidence Recording', status: 'Completed' },
      { id: 3, date: '15 Sep 2024', type: 'In-Person', court: 'High Court Bench Allahabad', judge: 'Hon. S.K. Verma', purpose: 'Bail Hearing', status: 'Completed' },
      { id: 4, date: '28 Aug 2024', type: 'Virtual (VC)', court: 'ACJM Court 3', judge: 'Hon. R.P. Mishra', purpose: 'Remand Extension', status: 'Completed' },
      { id: 5, date: '10 Aug 2024', type: 'In-Person', court: 'District Court, Prayagraj', judge: 'Hon. A.K. Sharma', purpose: 'Witness Cross-Exam', status: 'Completed' },
      { id: 6, date: '22 Jul 2024', type: 'Virtual (VC)', court: 'District Court, Prayagraj', judge: 'Hon. A.K. Sharma', purpose: 'Hearing', status: 'Completed' },
      { id: 7, date: '05 Jul 2024', type: 'In-Person', court: 'Special SC/ST Court', judge: 'Hon. M.L. Gupta', purpose: 'Argument', status: 'Completed' }
    ]
  }
};

export default function AdminSubDashboard() {
  const [searchInput, setSearchInput] = useState('UT-90142');
  const [selectedUt, setSelectedUt] = useState('UT-90142');
  const [activeTab, setActiveTab] = useState('productions'); // 'productions' | 'cases' | 'analytics'
  const [errorMessage, setErrorMessage] = useState('');
  
  // Modal visibility state for Cases Peshi Details
  const [showCasesModal, setShowCasesModal] = useState(false);

  const prisoner = MOCK_PRISONER_DATA[selectedUt];

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (MOCK_PRISONER_DATA[query]) {
      setSelectedUt(query);
      setErrorMessage('');
    } else {
      setErrorMessage(`No record found for UT Number "${query}". Try searching "UT-90142"`);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Top Search & Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span>🔍</span> Prisoner Intelligence & Production Analytics
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter Undertrial (UT) Number to inspect court appearances, VC stats, and legal cases.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter UT Number (e.g. UT-90142)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-red-600/20 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Quick Suggestions / Recent Chips */}
        <div className="flex items-center gap-2 mt-3 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">Quick Load:</span>
          <button
            onClick={() => { setSearchInput('UT-90142'); setSelectedUt('UT-90142'); setErrorMessage(''); }}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-[11px] px-2.5 py-1 rounded-md border border-slate-700 transition"
          >
            UT-90142 (Om Prakash)
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-2.5 rounded-lg flex items-center gap-2">
            ⚠️ {errorMessage}
          </div>
        )}
      </div>

      {prisoner ? (
        <>
          {/* Prisoner Overview Header Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-red-600/50 flex items-center justify-center text-xl font-bold text-slate-200 shadow-inner">
                  {prisoner.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white capitalize">{prisoner.name}</h3>
                    <span className="bg-red-500/10 text-red-400 text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-red-500/30 uppercase font-semibold">
                      {prisoner.custodyStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    S/O: <span className="text-slate-200 font-medium capitalize">{prisoner.fatherName}</span>
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-2 font-mono">
                    <span>UT ID: <strong className="text-red-400">{prisoner.utNumber}</strong></span>
                    <span>•</span>
                    <span>Primary FIR: <strong className="text-slate-200">{prisoner.primaryFir}</strong></span>
                    <span>•</span>
                    <span>Admitted: <strong className="text-slate-200">{prisoner.admissionDate}</strong></span>
                  </div>
                </div>
              </div>

              {/* Detention Ward / Location Details */}
              <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1.5 min-w-[240px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Cell/Ward:</span>
                  <span className="text-slate-200 font-medium">{prisoner.wardNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Police Jurisdiction:</span>
                  <span className="text-slate-200 font-medium">{prisoner.policeStation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Age / Gender:</span>
                  <span className="text-slate-200 font-medium">{prisoner.age} Yrs / {prisoner.gender}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Stat 1: Total Productions */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition"></div>
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
                <span>Total Productions</span>
                <span className="text-blue-400">⚖️</span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{prisoner.stats.totalProductions}</span>
                <span className="text-[11px] text-slate-400">Court Hearings</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Cumulative production record</p>
            </div>

            {/* Stat 2: VC vs Physical */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
                <span>VC vs In-Person</span>
                <span className="text-emerald-400">🖥️</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-emerald-400">{prisoner.stats.vcCount} <span className="text-xs font-normal text-slate-400">VC</span></div>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div>
                  <div className="text-xl font-bold text-amber-400">{prisoner.stats.inPersonCount} <span className="text-xs font-normal text-slate-400">Physical</span></div>
                </div>
              </div>
              {/* Ratio Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden flex">
                <div style={{ width: `${(prisoner.stats.vcCount / prisoner.stats.totalProductions) * 100}%` }} className="bg-emerald-500 h-full"></div>
                <div style={{ width: `${(prisoner.stats.inPersonCount / prisoner.stats.totalProductions) * 100}%` }} className="bg-amber-500 h-full"></div>
              </div>
            </div>

            {/* Stat 3: Active/Total Cases (CLICKABLE to open CasesPeshiDetails modal) */}
            <div
              onClick={() => setShowCasesModal(true)}
              className="bg-slate-900/80 border border-red-500/40 hover:border-red-500 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group cursor-pointer transition transform hover:-translate-y-0.5"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition"></div>
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
                <span className="text-red-400 font-bold underline decoration-dotted">Active Cases (View)</span>
                <span className="text-red-400">📑</span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{prisoner.stats.activeCases}</span>
                <span className="text-xs text-slate-400">/ {prisoner.stats.totalCases} Total</span>
              </div>
              <p className="text-[10px] text-emerald-400 mt-2 font-mono flex items-center gap-1">
                <span>🔍 Click to inspect case details</span>
              </p>
            </div>

            {/* Stat 4: Medical & Visitors */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
                <span>Visitors & Medical</span>
                <span className="text-purple-400">👥</span>
              </div>
              <div className="mt-3 flex justify-between items-center text-xs">
                <div>
                  <span className="block text-slate-400">Mulaqat</span>
                  <span className="text-lg font-bold text-white">{prisoner.stats.mulaqatVisits}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Medical OPD</span>
                  <span className="text-lg font-bold text-white">{prisoner.stats.medicalVisits}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Internal jail log history</p>
            </div>

          </div>

          {/* Sub Navigation Tabs */}
          <div className="border-b border-slate-800 flex space-x-6 text-xs font-medium">
            <button
              onClick={() => setActiveTab('productions')}
              className={`pb-3 transition relative cursor-pointer ${
                activeTab === 'productions'
                  ? 'text-red-400 border-b-2 border-red-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Court Production Log ({prisoner.productions.length})
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`pb-3 transition relative cursor-pointer ${
                activeTab === 'cases'
                  ? 'text-red-400 border-b-2 border-red-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Registered Cases ({prisoner.cases.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 transition relative cursor-pointer ${
                activeTab === 'analytics'
                  ? 'text-red-400 border-b-2 border-red-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Production Analytics & Breakdown
            </button>
          </div>

          {/* TAB 1: Court Production Log */}
          {activeTab === 'productions' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Production History Log
                </h4>
                <span className="text-[11px] text-slate-500">Sorted by most recent</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Mode</th>
                      <th className="p-3.5">Court / Bench</th>
                      <th className="p-3.5">Presiding Judge</th>
                      <th className="p-3.5">Purpose</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {prisoner.productions.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-mono text-slate-200">{item.date}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              item.type.includes('VC')
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-white">{item.court}</td>
                        <td className="p-3.5 text-slate-400">{item.judge}</td>
                        <td className="p-3.5">{item.purpose}</td>
                        <td className="p-3.5">
                          <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                            <span>✓</span> {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Registered Cases */}
          {activeTab === 'cases' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prisoner.cases.map((c, index) => (
                <div key={index} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500">Case No.</span>
                      <h5 className="text-sm font-bold text-white font-mono">{c.caseNo}</h5>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${c.statusBg}`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500">FIR Reference: </span>
                      <span className="font-mono text-slate-200">{c.firNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Sections Applied: </span>
                      <span className="text-red-400 font-mono">{c.sections}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Court: </span>
                      <span className="text-slate-200">{c.courtName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Production Analytics */}
          {activeTab === 'analytics' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Appearance Distribution Analysis
              </h4>

              <div className="space-y-4 max-w-xl">
                {/* VC Percentage */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Virtual Conference (VC) Appearances</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {Math.round((prisoner.stats.vcCount / prisoner.stats.totalProductions) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(prisoner.stats.vcCount / prisoner.stats.totalProductions) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* In Person Percentage */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Physical In-Court Escort</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {Math.round((prisoner.stats.inPersonCount / prisoner.stats.totalProductions) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${(prisoner.stats.inPersonCount / prisoner.stats.totalProductions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">📌 Security & Operational Summary:</p>
                <p>• High reliance on VC hearings reduces escort requirement and security overhead.</p>
                <p>• Physical escorts were strictly sanctioned for High Court & Special SC/ST trials.</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-slate-900/30 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-sm">Please search a valid UT Number to view stats.</p>
        </div>
      )}

      {/* Cases & Peshi Details Modal Component */}
      {showCasesModal && (
        <CasesPeshiDetails
          prisoner={prisoner}
          onClose={() => setShowCasesModal(false)}
        />
      )}
    </div>
  );
}