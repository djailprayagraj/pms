import React, { useState, useEffect } from 'react';
import CasesPeshiDetails from '../CasesPeshiDetails';
import { getUsers } from '../../../api/authService'; // Updated API import

export default function AdminSubDashboard() {
  const [prisonersList, setPrisonersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [selectedPrisoner, setSelectedPrisoner] = useState(null);
  const [activeTab, setActiveTab] = useState('productions'); // 'productions' | 'cases' | 'analytics'
  const [errorMessage, setErrorMessage] = useState('');
  
  // Modal visibility state for Cases Peshi Details
  const [showCasesModal, setShowCasesModal] = useState(false);

  // Fetch prisoners using the getUsers API on component mount
  useEffect(() => {
    const loadPrisoners = async () => {
      try {
        setLoading(true);
        // Fetching initial default records
        const response = await getUsers({ limit: 50 });
        console.log('Fetched Users Response:', response);

        const records = Array.isArray(response) 
          ? response 
          : response?.prisoners || response?.data || [];

        if (records.length > 0) {
          setPrisonersList(records);
          setSelectedPrisoner(records[0]);
          setSearchInput(records[0].RegisterNo || records[0].utNumber || '');
        }
      } catch (error) {
        console.error('Failed to fetch prisoners:', error);
        setErrorMessage('Failed to connect to server and fetch prisoner records.');
      } finally {
        setLoading(false);
      }
    };

    loadPrisoners();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchInput.trim();
    
    if (!query) {
      setErrorMessage('Please enter a valid Register/UT Number.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      // Pass utNumber explicitly. 
      // Note: Ensure your authService getUsers helper appends a cache-buster or 
      // your backend disables caching to prevent 304 Not Modified cache locks.
      const response = await getUsers({ utNumber: query });
      const records = Array.isArray(response) 
        ? response 
        : response?.prisoners || response?.data || [];

      if (records.length > 0) {
        setPrisonersList(records);
        setSelectedPrisoner(records[0]);
      } else {
        // Fallback to local filtering if backend didn't return a direct match
        const found = prisonersList.find(
          (p) => 
            (p.RegisterNo && p.RegisterNo.toUpperCase() === query.toUpperCase()) ||
            (p.utNumber && p.utNumber.toUpperCase() === query.toUpperCase()) ||
            (p.JID && p.JID.toUpperCase() === query.toUpperCase()) ||
            (p.PrisonerName && p.PrisonerName.toUpperCase().includes(query.toUpperCase()))
        );

        if (found) {
          setSelectedPrisoner(found);
        } else {
          setErrorMessage(`No record found matching "${query}".`);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setErrorMessage('Error executing search query.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (prisoner) => {
    setSelectedPrisoner(prisoner);
    setSearchInput(prisoner.RegisterNo || prisoner.utNumber || '');
    setErrorMessage('');
  };

  if (loading && prisonersList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-mono text-xs">
        Loading prisoner intelligence & analytics...
      </div>
    );
  }

  // Helper mappings for live API prisoner attributes
  const name = selectedPrisoner?.PrisonerName || selectedPrisoner?.name || 'Unknown Prisoner';
  const avatarInitials = name !== 'Unknown Prisoner' 
    ? name.split(' ').map(n => n?.[0] || '').join('').toUpperCase() 
    : 'TP';

  const fatherName = selectedPrisoner?.FatherName || selectedPrisoner?.fatherName || 'N/A';
  const registerNo = selectedPrisoner?.RegisterNo || selectedPrisoner?.utNumber || 'N/A';
  const wardNo = selectedPrisoner?.Ward || selectedPrisoner?.Barrack || 'Unassigned';
  const policeStation = `${selectedPrisoner?.PSName || selectedPrisoner?.policeStation || 'N/A'}, ${selectedPrisoner?.PSDistrict || ''}`;
  const primaryFir = selectedPrisoner?.['FIR/Case No'] || selectedPrisoner?.primaryFir || 'N/A';
  const admissionDate = selectedPrisoner?.FirstAdmissionDate || selectedPrisoner?.admissionDate || 'N/A';
  const custodyStatus = (selectedPrisoner?.PrisonerType === 'UT' || selectedPrisoner?.custodyStatus === 'Under Trial') ? 'Under Trial' : 'Convict';
  const age = selectedPrisoner?.Age || selectedPrisoner?.age || 'N/A';
  const gender = selectedPrisoner?.Gender === 'M' || selectedPrisoner?.gender === 'Male' ? 'Male' : 'Female';

  // Extract cases array safely
  const casesData = Array.isArray(selectedPrisoner?.allCases) && selectedPrisoner.allCases.length > 0 
    ? selectedPrisoner.allCases.map(c => ({
        caseNo: c.caseNo || selectedPrisoner['FIR/Case No'] || 'N/A',
        firNo: c.firNo || selectedPrisoner['14-Digit FIR No'] || 'N/A',
        courtName: c.courtName || selectedPrisoner['Court Name'] || 'District Court',
        sections: c.sections || selectedPrisoner['Act Section'] || 'N/A',
        warrantType: c.warrantType || (selectedPrisoner.JudgeName ? `Judge: ${selectedPrisoner.JudgeName}` : 'Standard Warrant'),
        rihaiDate: c.rihaiDate || selectedPrisoner.ReleaseDate || 'Pending',
        status: c.status || (selectedPrisoner.Status === 'True' ? 'Under Trial' : 'Disposed'),
        statusBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      }))
    : [
        {
          caseNo: selectedPrisoner?.['FIR/Case No'] || 'N/A',
          firNo: selectedPrisoner?.['14-Digit FIR No'] || 'N/A',
          courtName: selectedPrisoner?.['Court Name'] || 'District Court',
          sections: selectedPrisoner?.['Act Section'] || 'N/A',
          warrantType: selectedPrisoner?.JudgeName ? `Judge: ${selectedPrisoner.JudgeName}` : 'Standard Warrant',
          rihaiDate: selectedPrisoner?.ReleaseDate || 'Pending',
          status: 'Under Trial',
          statusBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }
      ];

  // Production logs mapped dynamically
  const productionsData = selectedPrisoner?.productions || [
    { 
      id: 1, 
      date: selectedPrisoner?.NextDate || 'N/A', 
      type: 'Virtual (VC)', 
      court: selectedPrisoner?.['Court Name'] || 'District Court', 
      judge: selectedPrisoner?.JudgeName || 'Hon. Judge', 
      purpose: 'Hearing / Production', 
      status: 'Scheduled' 
    }
  ];

  const totalProductions = productionsData.length;
  const vcCount = productionsData.filter(p => p.type.includes('VC')).length || 1;
  const inPersonCount = totalProductions - vcCount;

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
              Search by UT/Register Number (e.g. 752/26) or select from recent database entries.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter UT Number (e.g. 752/26)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Quick Suggestions / Recent Chips from API list */}
        <div className="flex items-center gap-2 mt-3 text-xs overflow-x-auto pb-1">
          <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap">Recent UT Numbers:</span>
          {prisonersList.slice(0, 5).map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickSelect(p)}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-[11px] px-2.5 py-1 rounded-md border border-slate-700 transition whitespace-nowrap cursor-pointer"
            >
              {p.RegisterNo || p.utNumber} ({p.PrisonerName ? p.PrisonerName.split(' ')[0] : 'N/A'})
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="mt-3 text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-2.5 rounded-lg flex items-center gap-2">
            ⚠️ {errorMessage}
          </div>
        )}
      </div>

      {selectedPrisoner ? (
        <>
          {/* Prisoner Overview Header Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-red-600/50 flex items-center justify-center text-xl font-bold text-slate-200 shadow-inner">
                  {avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white capitalize">{name}</h3>
                    <span className="bg-red-500/10 text-red-400 text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-red-500/30 uppercase font-semibold">
                      {custodyStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Father's Name: <span className="text-slate-200 font-medium capitalize">{fatherName}</span>
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-2 font-mono">
                    <span>UT No: <strong className="text-red-400">{registerNo}</strong></span>
                    <span>•</span>
                    <span>Primary FIR: <strong className="text-slate-200">{primaryFir}</strong></span>
                    <span>•</span>
                    <span>JID: <strong className="text-slate-200">{selectedPrisoner.JID || 'N/A'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Detention Ward / Location Details */}
              <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1.5 min-w-[240px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Ward/Barrack:</span>
                  <span className="text-slate-200 font-medium">{wardNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Police Jurisdiction:</span>
                  <span className="text-slate-200 font-medium">{policeStation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Age / Gender:</span>
                  <span className="text-slate-200 font-medium">{age} Yrs / {gender}</span>
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
                <span className="text-3xl font-extrabold text-white">{totalProductions}</span>
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
                  <div className="text-xl font-bold text-emerald-400">{vcCount} <span className="text-xs font-normal text-slate-400">VC</span></div>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div>
                  <div className="text-xl font-bold text-amber-400">{inPersonCount} <span className="text-xs font-normal text-slate-400">Physical</span></div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden flex">
                <div style={{ width: `${(vcCount / totalProductions) * 100}%` }} className="bg-emerald-500 h-full"></div>
                <div style={{ width: `${(inPersonCount / totalProductions) * 100}%` }} className="bg-amber-500 h-full"></div>
              </div>
            </div>

            {/* Stat 3: Active/Total Cases */}
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
                <span className="text-3xl font-extrabold text-white">{selectedPrisoner.totalCasesCount || casesData.length}</span>
                <span className="text-xs text-slate-400">Total Cases</span>
              </div>
              <p className="text-[10px] text-emerald-400 mt-2 font-mono flex items-center gap-1">
                <span>🔍 Click to inspect case details</span>
              </p>
            </div>

            {/* Stat 4: Next Court Date */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
                <span>Next Court Date</span>
                <span className="text-purple-400">📅</span>
              </div>
              <div className="mt-3 text-xs">
                <span className="block text-slate-400 font-mono">Scheduled Date:</span>
                <span className="text-lg font-bold text-white font-mono">{selectedPrisoner.NextDate || 'N/A'}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Presiding: {selectedPrisoner.JudgeName || 'N/A'}</p>
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
              Court Production Log ({productionsData.length})
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`pb-3 transition relative cursor-pointer ${
                activeTab === 'cases'
                  ? 'text-red-400 border-b-2 border-red-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Registered Cases ({casesData.length})
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
                    {productionsData.map((item) => (
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
              {casesData.map((c, index) => (
                <div key={index} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500">Case No.</span>
                      <h5 className="text-sm font-bold text-white font-mono">{c.caseNo}</h5>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border font-semibold bg-amber-500/10 text-amber-400 border-amber-500/30">
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
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Virtual Conference (VC) Appearances</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {Math.round((vcCount / totalProductions) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(vcCount / totalProductions) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Physical In-Court Escort</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {Math.round((inPersonCount / totalProductions) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${(inPersonCount / totalProductions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">📌 Security & Operational Summary:</p>
                <p>• High reliance on VC hearings reduces escort requirement and security overhead.</p>
                <p>• Presiding Court / Judge: {selectedPrisoner['Court Name'] || 'N/A'} ({selectedPrisoner.JudgeName || 'N/A'})</p>
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
      {showCasesModal && selectedPrisoner && (
        <CasesPeshiDetails
          prisoner={{
            ...selectedPrisoner,
            name: name,
            utNumber: registerNo,
            wardNo: wardNo,
            policeStation: policeStation,
            custodyStatus: custodyStatus,
            cases: casesData
          }}
          onClose={() => setShowCasesModal(false)}
        />
      )}
    </div>
  );
}