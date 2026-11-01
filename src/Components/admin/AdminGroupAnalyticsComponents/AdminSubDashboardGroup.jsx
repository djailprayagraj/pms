import React, { useState } from 'react';

// Collective Mock Database for Multiple Prisoners with Dual Warrant Change Dates
const MOCK_GROUP_PRISONERS = [
  {
    utNumber: 'UT-90142',
    name: 'Om Prakash',
    fatherName: 'Bhagwat Prashad',
    ward: 'Ward 4B',
    warrantChangeDate1: '2026-08-10', // 167 CrPC to 209 CrPC change date
    warrantChangeDate2: '2026-08-25', // 209 CrPC to 309 CrPC change date
    currentStage: 'Sec 309 CrPC / 346 BNSS (Trial)',
    productions: [
      { id: 101, date: '2026-10-05', type: 'Virtual (VC)', court: 'District Court', warrant: 'Sec 309 CrPC / 346 BNSS (Trial Remand)', purpose: 'Hearing' },
      { id: 102, date: '2026-08-10', type: 'In-Person', court: 'Sessions Court', warrant: 'Sec 209 CrPC / 239 BNSS (Committal)', purpose: 'Committal Order' },
      { id: 103, date: '2026-07-22', type: 'Virtual (VC)', court: 'ACJM Court 3', warrant: 'Sec 167 CrPC / 187 BNSS (Initial Remand)', purpose: 'Police Custody Remand' },
    ]
  },
  {
    utNumber: 'UT-90188',
    name: 'Rajesh Kumar',
    fatherName: 'Ram Vishal',
    ward: 'Ward 2A',
    warrantChangeDate1: '2026-08-01',
    warrantChangeDate2: '2026-09-15',
    currentStage: 'Sec 309 CrPC / 346 BNSS (Trial)',
    productions: [
      { id: 201, date: '2026-10-12', type: 'Virtual (VC)', court: 'District Court', warrant: 'Sec 309 CrPC / 346 BNSS (Trial Remand)', purpose: 'Evidence' },
      { id: 202, date: '2026-09-01', type: 'In-Person', court: 'ACJM Court 1', warrant: 'Sec 167 CrPC / 187 BNSS (Initial Remand)', purpose: 'Remand Extension' },
    ]
  },
  {
    utNumber: 'UT-90210',
    name: 'Mohd. Zaid',
    fatherName: 'Abdul Rauf',
    ward: 'Ward 5C',
    warrantChangeDate1: '2026-07-01',
    warrantChangeDate2: 'Pending (Under Committal)',
    currentStage: 'Sec 209 CrPC / 239 BNSS (Committal)',
    productions: [
      { id: 301, date: '2026-10-10', type: 'Virtual (VC)', court: 'Special Court', warrant: 'Sec 209 CrPC / 239 BNSS (Committal)', purpose: 'Charges Hearing' },
      { id: 302, date: '2026-06-12', type: 'In-Person', court: 'Magistrate Court', warrant: 'Sec 167 CrPC / 187 BNSS (Initial Remand)', purpose: 'First Production' },
    ]
  }
];

export default function AdminSubDashboardGroup() {
  // Date Range State
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-10-20');
  const [selectedWarrantType, setSelectedWarrantType] = useState('ALL');
  const [selectedModeFilter, setSelectedModeFilter] = useState('ALL'); // 'ALL' | 'VC' | 'IN_PERSON'
  const [activeTab, setActiveTab] = useState('productions'); // 'productions' | 'conversions'

  // Filter productions across all prisoners based on date range, warrant, and VC/In-Person mode
  const getAllFilteredProductions = () => {
    let list = [];
    MOCK_GROUP_PRISONERS.forEach((p) => {
      p.productions.forEach((prod) => {
        const prodDate = new Date(prod.date);
        const start = startDate ? new Date(startDate) : new Date('2000-01-01');
        const end = endDate ? new Date(endDate) : new Date('2100-01-01');
        const inDateRange = prodDate >= start && prodDate <= end;

        const matchesWarrant =
          selectedWarrantType === 'ALL' ||
          (selectedWarrantType === '167' && prod.warrant.includes('167')) ||
          (selectedWarrantType === '209' && prod.warrant.includes('209')) ||
          (selectedWarrantType === '309' && prod.warrant.includes('309'));

        const matchesMode =
          selectedModeFilter === 'ALL' ||
          (selectedModeFilter === 'VC' && prod.type.includes('VC')) ||
          (selectedModeFilter === 'IN_PERSON' && prod.type.includes('In-Person'));

        if (inDateRange && matchesWarrant && matchesMode) {
          list.push({
            ...prod,
            utNumber: p.utNumber,
            prisonerName: p.name,
            ward: p.ward
          });
        }
      });
    });
    return list;
  };

  const filteredProductions = getAllFilteredProductions();

  // Aggregate Stats Counts for Group
  const totalGroupProductions = filteredProductions.length;
  const count167 = filteredProductions.filter(p => p.warrant.includes('167')).length;
  const count209 = filteredProductions.filter(p => p.warrant.includes('209')).length;
  const count309 = filteredProductions.filter(p => p.warrant.includes('309')).length;
  const vcGroupCount = filteredProductions.filter(p => p.type.includes('VC')).length;
  const physicalGroupCount = filteredProductions.filter(p => p.type.includes('In-Person')).length;

  // Export Collective Group Report as CSV
  const exportGroupCSV = () => {
    if (!filteredProductions.length) {
      alert('No production records found for the selected filter criteria.');
      return;
    }

    const headers = ['UT Number,Prisoner Name,Ward,Date,Mode,Court,Warrant Authority,Purpose'];
    const rows = filteredProductions.map(p =>
      `"${p.utNumber}","${p.prisonerName}","${p.ward}","${p.date}","${p.type}","${p.court}","${p.warrant}","${p.purpose}"`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Group_Prisoner_Production_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Top Banner Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span>👥</span> Collective Group Warrant & Production Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor jail-wide court appearances, warrant classifications (Sec 167/187, 209/239, 309/346), and dual warrant change milestone dates.
          </p>
        </div>

        {/* Global Export Button */}
        <button
          onClick={exportGroupCSV}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-2 cursor-pointer shrink-0"
        >
          📥 Export Group Report (.CSV)
        </button>
      </div>

      {/* Filter Bar (Date Range, Warrant Section, and Mode Filter) */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-400 font-mono">Date Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-red-500"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-red-500"
          />

          {/* Warrant Type Filter */}
          <select
            value={selectedWarrantType}
            onChange={(e) => setSelectedWarrantType(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Warrant Categories</option>
            <option value="167">Sec 167 CrPC / 187 BNSS (Remand)</option>
            <option value="209">Sec 209 CrPC / 239 BNSS (Committal)</option>
            <option value="309">Sec 309 CrPC / 346 BNSS (Trial)</option>
          </select>

          {/* Mode Filter (VC vs In-Person) */}
          <select
            value={selectedModeFilter}
            onChange={(e) => setSelectedModeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Production Modes</option>
            <option value="VC">🖥️ Only Virtual Conference (VC)</option>
            <option value="IN_PERSON">🏛️ Only In-Person Escort</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Prisoners in Group: <strong className="text-white">{MOCK_GROUP_PRISONERS.length}</strong>
        </div>
      </div>

      {/* Group Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Productions in Period */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
            <span>Filtered Productions</span>
            <span>⚖️</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{totalGroupProductions}</div>
          <p className="text-[10px] text-slate-500 mt-2">Within selected filters</p>
        </div>

        {/* Stat 2: Remand (167/187) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
            <span>Sec 167 / 187 Remand</span>
            <span className="text-amber-400">📋</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-400">{count167}</div>
          <p className="text-[10px] text-slate-500 mt-2">Initial police/judicial remand</p>
        </div>

        {/* Stat 3: Committal (209/239) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
            <span>Sec 209 / 239 Committal</span>
            <span className="text-purple-400">🏛️</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-purple-400">{count209}</div>
          <p className="text-[10px] text-slate-500 mt-2">Sessions court commitment</p>
        </div>

        {/* Stat 4: Trial Remand (309/346) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
            <span>Sec 309 / 346 Trial</span>
            <span className="text-indigo-400">📑</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-indigo-400">{count309}</div>
          <p className="text-[10px] text-slate-500 mt-2">Ongoing inquiry & trial</p>
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
          Group Production Log ({filteredProductions.length})
        </button>
        <button
          onClick={() => setActiveTab('conversions')}
          className={`pb-3 transition relative cursor-pointer ${
            activeTab === 'conversions'
              ? 'text-red-400 border-b-2 border-red-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dual Warrant Change Dates ({MOCK_GROUP_PRISONERS.length})
        </button>
      </div>

      {/* TAB 1: Group Production Logs Table */}
      {activeTab === 'productions' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Collective Prisoner Productions
            </h4>
            <div className="text-xs text-slate-400 font-mono">
              VC: <span className="text-emerald-400 font-bold">{vcGroupCount}</span> | Physical: <span className="text-amber-400 font-bold">{physicalGroupCount}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">UT No. & Name</th>
                  <th className="p-3.5">Ward</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Warrant / Authority Section</th>
                  <th className="p-3.5">Mode</th>
                  <th className="p-3.5">Court Name</th>
                  <th className="p-3.5">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProductions.length > 0 ? (
                  filteredProductions.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{p.prisonerName}</div>
                        <span className="font-mono text-[10px] text-red-400">{p.utNumber}</span>
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono">{p.ward}</td>
                      <td className="p-3.5 font-mono text-slate-200">{p.date}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-1 rounded text-[10px] font-mono font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                          {p.warrant}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            p.type.includes('VC')
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {p.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-white">{p.court}</td>
                      <td className="p-3.5 text-slate-300">{p.purpose}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-500 font-mono text-xs">
                      No production records found for the selected mode and filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Dual Warrant Change Dates Timeline */}
      {activeTab === 'conversions' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Dual Warrant Change Milestones & Transition Dates
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Tracking exact dates when prisoners transitioned from Remand to Committal, and Committal to Trial.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Prisoner</th>
                  <th className="p-3.5">Ward</th>
                  <th className="p-3.5">1st Warrant Change Date (167 → 209)</th>
                  <th className="p-3.5">2nd Warrant Change Date (209 → 309)</th>
                  <th className="p-3.5">Current Active Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {MOCK_GROUP_PRISONERS.map((prisoner, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{prisoner.name}</div>
                      <span className="font-mono text-[10px] text-red-400">{prisoner.utNumber}</span>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono">{prisoner.ward}</td>
                    <td className="p-3.5 font-mono text-amber-400">
                      📅 {prisoner.warrantChangeDate1}
                    </td>
                    <td className="p-3.5 font-mono text-indigo-400">
                      📅 {prisoner.warrantChangeDate2}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/35">
                        {prisoner.currentStage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}