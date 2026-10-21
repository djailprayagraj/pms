import React, { useState } from 'react';

const DashboardWorkingArea = () => {
  // --- Search Tab State ---
  const [searchTab, setSearchTab] = useState('ut'); // 'ut', 'name', 'crime'

  // --- Search Inputs ---
  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCrime, setSearchCrime] = useState('');

  // --- Search Results & UI States ---
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [prisonerResult, setPrisonerResult] = useState(null);

  // --- Form Input States for Adalat Feeding ---
  const [peshiDate, setPeshiDate] = useState('');
  const [courtName, setCourtName] = useState('');
  const [adalatType, setAdalatType] = useState('Lok Adalat');
  const [peshiRemarks, setPeshiRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  // --- Mock Database: History Records ---
  const [historyRecords, setHistoryRecords] = useState([
    {
      id: 1,
      utNumber: '4092/26',
      name: 'Rajesh Kumar Sharma',
      barrack: 'Barrack No. 4 (High Security)',
      warrantType: '346 BNSS',
      peshiDate: '2026-10-15',
      adalatType: 'Special Jail Adalat',
      courtName: 'Court of Special Judge (EC Act)',
      remarks: 'Bail application filed, adjourned to next date.',
      status: 'In Custody',
    },
    {
      id: 2,
      utNumber: '1205/25',
      name: 'Amit Vikram Singh',
      barrack: 'Barrack No. 2',
      warrantType: '167 CRPC',
      peshiDate: '2026-10-18',
      adalatType: 'Lok Adalat',
      courtName: 'CJM Court, Prayagraj',
      remarks: 'Compounded under Section 320 CrPC, Disposed.',
      status: 'Released/Bail',
    },
  ]);

  // --- Handle Search Submission ---
  const handleSearch = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitSuccess('');
    setPrisonerResult(null);

    // Basic Validations based on Search Tab
    if (searchTab === 'ut') {
      const num1 = parseInt(part1, 10);
      if (isNaN(num1) || num1 < 1 || num1 > 99999) {
        setErrorMsg('First part of UT number must be between 1 and 99999.');
        return;
      }
      const num2 = parseInt(part2, 10);
      if (isNaN(num2) || num2 < 24 || num2 > 99) {
        setErrorMsg('Second part of UT number must be a two-digit year code (24-99).');
        return;
      }
    } else if (searchTab === 'name' && !searchName.trim()) {
      setErrorMsg('Please enter a prisoner name to search.');
      return;
    } else if (searchTab === 'crime' && !searchCrime.trim()) {
      setErrorMsg('Please enter a Crime / FIR Number to search.');
      return;
    }

    setLoading(true);

    // Simulate Database lookup delay
    setTimeout(() => {
      setLoading(false);

      const computedUT =
        searchTab === 'ut' ? `${part1}/${part2}` : searchTab === 'crime' ? '4092/26' : '3104/25';
      const computedName =
        searchTab === 'name' ? searchName.trim() : 'Rajesh Kumar Sharma';

      const mockResponse = {
        utNumber: computedUT,
        prisonerName: computedName,
        fatherName: 'Late Ram Swaroop Sharma',
        barrack: 'Barrack No. 4 (High Security)',
        gender: 'Male',
        age: 38,
        totalCases: 2,
        cases: [
          {
            firNo: searchTab === 'crime' ? searchCrime.trim() : `CR - 142/${part2 || '26'}`,
            actSection: '302, 201 IPC & Section 4/25 Arms Act',
            psName: 'Civil Lines, Prayagraj',
            courtName: 'Court of Special Judge (EC Act) / Sessions Court',
            warrantType: '346 BNSS',
            isRiha: false,
          },
          {
            firNo: `CR - 89/${Number(part2 || 26) - 1}`,
            actSection: '392, 411 IPC',
            psName: 'George Town, Prayagraj',
            courtName: 'Chief Judicial Magistrate Court, Prayagraj',
            warrantType: '167 CRPC',
            isRiha: true,
          },
        ],
      };

      setPrisonerResult(mockResponse);
      setCourtName(mockResponse.cases[0].courtName);
    }, 500);
  };

  // --- Handle Adalat Peshi Feeding Form Submission ---
  const handleAdalatSubmit = (e) => {
    e.preventDefault();
    if (!prisonerResult) return;

    if (!peshiDate) {
      setErrorMsg('Please select a valid Peshi / Adalat Date.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Simulate sending data to MongoDB collection
    setTimeout(() => {
      setIsSubmitting(false);

      const newHistoryItem = {
        id: Date.now(),
        utNumber: prisonerResult.utNumber,
        name: prisonerResult.prisonerName,
        barrack: prisonerResult.barrack,
        warrantType: prisonerResult.cases[0].warrantType,
        peshiDate: peshiDate,
        adalatType: adalatType,
        courtName: courtName || prisonerResult.cases[0].courtName,
        remarks: peshiRemarks || 'Adalat proceeding updated.',
        status: prisonerResult.cases[0].isRiha ? 'Released/Bail' : 'In Custody',
      };

      setHistoryRecords([newHistoryItem, ...historyRecords]);
      setSubmitSuccess(
        `Adalat record for ${prisonerResult.prisonerName} (UT: ${prisonerResult.utNumber}) submitted successfully to database!`
      );

      // Reset form fields
      setPeshiDate('');
      setPeshiRemarks('');
    }, 600);
  };

  // --- Compute Real-time Statistics ---
  const totalSubmissions = historyRecords.length;
  const inCustodyCount = historyRecords.filter((r) => r.status === 'In Custody').length;
  const releasedCount = historyRecords.filter((r) => r.status === 'Released/Bail').length;
  const uniqueBarracks = new Set(historyRecords.map((r) => r.barrack)).size;

  return (
    <div className="space-y-6">
      {/* Search Header and Input Card */}
      <div className='flex Search-and-history'>


           {/* Adalat Feeding History Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Adalat Feeding History Logs</h3>
            <p className="text-[11px] text-slate-400">Recently saved prisoner Adalat entries saved to the database.</p>
          </div>
          <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg font-mono text-slate-300">
            Total Entries: {historyRecords.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-mono">
                <th className="p-3">UT Number</th>
                <th className="p-3">Prisoner Name</th>
                <th className="p-3">Assigned Barrack</th>
                <th className="p-3">Warrant Type</th>
                <th className="p-3">Peshi Date</th>
                <th className="p-3">Adalat Type & Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {historyRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-slate-500 italic">
                    No Adalat records submitted yet.
                  </td>
                </tr>
              ) : (
                historyRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-red-400 font-bold">{record.utNumber}</td>
                    <td className="p-3 text-white font-sans font-semibold">{record.name}</td>
                    <td className="p-3 text-slate-300">{record.barrack}</td>
                    <td className="p-3 text-slate-300">
                      <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[10px]">
                        {record.warrantType}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-400">{record.peshiDate}</td>
                    <td className="p-3 text-slate-400 text-[11px] font-sans">
                      <span className="font-semibold text-slate-200">{record.adalatType}</span> ({record.courtName}) -{' '}
                      <span className="italic">{record.remarks}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      </div>
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">
            Jail Adalat Data Feeding & Inmate Lookup
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search prisoner records by UT Number, Inmate Name, or Crime/FIR Number to feed Adalat Peshi details.
          </p>
        </div>

        {/* Search Mode Tabs */}
        <div className="flex border-b border-slate-800 gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setSearchTab('ut')}
            className={`pb-2 px-3 border-b-2 font-medium transition ${
              searchTab === 'ut'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Search by UT Number
          </button>
          <button
            type="button"
            onClick={() => setSearchTab('name')}
            className={`pb-2 px-3 border-b-2 font-medium transition ${
              searchTab === 'name'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Search by Prisoner Name
          </button>
          <button
            type="button"
            onClick={() => setSearchTab('crime')}
            className={`pb-2 px-3 border-b-2 font-medium transition ${
              searchTab === 'crime'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Search by Crime / FIR No.
          </button>
        </div>

        {/* Dynamic Search Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {searchTab === 'ut' && (
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-mono">UT No:</span>
              <input
                type="number"
                min="1"
                max="99999"
                placeholder="Ex. 4092"
                value={part1}
                onChange={(e) => setPart1(e.target.value)}
                className="bg-transparent text-xs text-white font-mono focus:outline-none w-24 text-center placeholder-slate-600"
                required
              />
              <span className="text-slate-600 font-bold">/</span>
              <input
                type="number"
                min="24"
                max="99"
                placeholder="26"
                value={part2}
                onChange={(e) => setPart2(e.target.value)}
                className="bg-transparent text-xs text-white font-mono focus:outline-none w-14 text-center placeholder-slate-600"
                required
              />
            </div>
          )}

          {searchTab === 'name' && (
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 w-full sm:w-80">
              <span className="text-xs text-slate-500 font-mono">Name:</span>
              <input
                type="text"
                placeholder="Ex. Rajesh Kumar Sharma"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="bg-transparent text-xs text-white font-mono focus:outline-none w-full placeholder-slate-600"
                required
              />
            </div>
          )}

          {searchTab === 'crime' && (
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 w-full sm:w-80">
              <span className="text-xs text-slate-500 font-mono">FIR No:</span>
              <input
                type="text"
                placeholder="Ex. CR - 142/26 or 142"
                value={searchCrime}
                onChange={(e) => setSearchCrime(e.target.value)}
                className="bg-transparent text-xs text-white font-mono focus:outline-none w-full placeholder-slate-600"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-medium px-6 py-2 rounded-lg text-xs transition shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? 'Fetching Database Records...' : 'Fetch Prisoner Record'}
          </button>
        </form>

        {errorMsg && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 px-3 py-2 rounded-lg text-xs font-mono">
            ⚠️ {errorMsg}
          </div>
        )}
        {submitSuccess && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 px-3 py-2 rounded-lg text-xs font-mono">
            ✓ {submitSuccess}
          </div>
        )}
      </div>

      {/* Prisoner Case Records Tabular Display */}
      {prisonerResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-4 p-4 animate-fadeIn">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono uppercase">
                  UT No: {prisonerResult.utNumber}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {prisonerResult.barrack}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{prisonerResult.prisonerName}</h3>
              <p className="text-xs text-slate-400 font-mono">
                S/o {prisonerResult.fatherName} | Gender: {prisonerResult.gender} | Age: {prisonerResult.age}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
              Tracked FIRs: <span className="text-red-400 font-bold">{prisonerResult.totalCases}</span>
            </div>
          </div>

          {/* Cases Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
                  <th className="p-3">Crime / FIR Number</th>
                  <th className="p-3">Under Sections</th>
                  <th className="p-3">Police Station</th>
                  <th className="p-3">Pending Court</th>
                  <th className="p-3 text-center">Warrant Type</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {prisonerResult.cases.map((c, index) => (
                  <tr key={index} className={`hover:bg-slate-800/40 transition ${c.isRiha ? 'opacity-60 bg-slate-950/40' : ''}`}>
                    <td className="p-3 font-mono text-red-400 font-medium">{c.firNo}</td>
                    <td className="p-3 font-mono text-slate-300">{c.actSection}</td>
                    <td className="p-3 text-slate-300">{c.psName}</td>
                    <td className="p-3 text-slate-300">{c.courtName}</td>
                    <td className="p-3 text-center">
                      <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-mono font-bold">
                        {c.warrantType}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {c.isRiha ? (
                        <span className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2 py-1 rounded text-[10px] font-mono font-bold">
                          RIHA (Released)
                        </span>
                      ) : (
                        <span className="bg-red-950/80 border border-red-900 text-red-300 px-2 py-1 rounded text-[10px] font-mono font-bold">
                          ACTIVE CUSTODY
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Adalat Feeding Form & Submit Section */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
           

           
          </div>
        </div>
      )}

   

      {/* Real-time Statistics Bar Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
        <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider mb-3">
          Adalat Feeding Statistics & Operational Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <div className="text-xs text-slate-400 font-mono">Total Submitted Records</div>
            <div className="text-xl font-extrabold text-white mt-1 font-mono">{totalSubmissions}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <div className="text-xs text-slate-400 font-mono">In Active Custody</div>
            <div className="text-xl font-extrabold text-red-400 mt-1 font-mono">{inCustodyCount}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <div className="text-xs text-slate-400 font-mono">Bail / Released Count</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">{releasedCount}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <div className="text-xs text-slate-400 font-mono">Barracks Tracked</div>
            <div className="text-xl font-extrabold text-indigo-400 mt-1 font-mono">{uniqueBarracks}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWorkingArea;