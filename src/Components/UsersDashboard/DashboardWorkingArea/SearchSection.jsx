import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setSearchTab,
  setPart1,
  setPart2,
  setSearchName,
  setSearchCrime,
  toggleSelectCase,
  addHistoryEntries,
  setSubmitSuccess,
  setErrorMsg,
} from '../../../redux/slices/adalatSlice';
import Toast from '../../Popups/Toast';
import { postAdalatEntries } from '../../../api/adalatService';
import prayagrajCourts from '../../../constants/searchbox';

// Warrant Type Sanitizer to Prevent Mongoose Enum Validation Errors
const sanitizeWarrantType = (val) => {
  const allowed = ['167/187', '209/232', '309/346'];
  const cleaned = typeof val === 'string' ? val.trim() : '';
  return allowed.includes(cleaned) ? cleaned : '167/187';
};

const SearchSection = ({ handleSearch }) => {
  const dispatch = useDispatch();

  // Fine-grained selectors to prevent full-component re-renders on keystrokes
  const searchTab = useSelector((state) => state.adalat?.searchTab);
  const part1 = useSelector((state) => state.adalat?.part1);
  const part2 = useSelector((state) => state.adalat?.part2);
  const searchName = useSelector((state) => state.adalat?.searchName);
  const searchCrime = useSelector((state) => state.adalat?.searchCrime);
  const loading = useSelector((state) => state.adalat?.loading);
  const errorMsg = useSelector((state) => state.adalat?.errorMsg);
  const submitSuccess = useSelector((state) => state.adalat?.submitSuccess);
  const prisonerResult = useSelector((state) => state.adalat?.prisonerResult);
  const selectedCaseIds = useSelector((state) => state.adalat?.selectedCaseIds || []);
  const mainAction = useSelector((state) => state.adalat?.mainAction);
  const subOption = useSelector((state) => state.adalat?.subOption);
  const selectedDate = useSelector((state) => state.adalat?.selectedDate);
  const historyRecords = useSelector((state) => state.adalat?.historyRecords || []);

  // Local state for submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local Toast State
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '', key: 0 });

  const showToast = (type, title, message) => {
    setToast({
      show: true,
      type,
      title,
      message,
      key: Date.now(),
    });
  };

  // Sync Redux errorMsg to Toast
  useEffect(() => {
    if (errorMsg) {
      showToast('error', 'Validation Error', errorMsg);
      dispatch(setErrorMsg(null));
    }
  }, [errorMsg, dispatch]);

  // Sync Redux submitSuccess to Toast
  useEffect(() => {
    if (submitSuccess) {
      showToast('success', 'Operation Successful', submitSuccess);
      dispatch(setSubmitSuccess(null));
    }
  }, [submitSuccess, dispatch]);

  // Local state for Field Overrides
  const [localWarrantOverrides, setLocalWarrantOverrides] = useState({});
  const [localStatusOverrides, setLocalStatusOverrides] = useState({});
  const [localCourtOverrides, setLocalCourtOverrides] = useState({});

  // Active dropdown autocomplete state for court inputs
  const [activeCourtDropdown, setActiveCourtDropdown] = useState(null);
  const courtDropdownRef = useRef(null);

  // Close court autocomplete suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (courtDropdownRef.current && !courtDropdownRef.current.contains(event.target)) {
        setActiveCourtDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Deduplicate Cases List & Apply Local Overrides
  const uniqueCases = React.useMemo(() => {
    if (!prisonerResult?.cases) return [];

    const processed = prisonerResult.cases.reduce((acc, currentCase) => {
      const caseKey = currentCase.id || currentCase.firNo;
      const isDuplicate = acc.some((item) => (item.id || item.firNo) === caseKey);

      if (!isDuplicate) {
        const overrideWarrant = localWarrantOverrides[caseKey];
        const overrideStatus = localStatusOverrides[caseKey];
        const overrideCourt = localCourtOverrides[caseKey];

        acc.push({
          ...currentCase,
          warrantType: overrideWarrant !== undefined ? overrideWarrant : sanitizeWarrantType(currentCase.warrantType),
          isRiha: overrideStatus !== undefined ? overrideStatus : Boolean(currentCase.isRiha),
          courtName: overrideCourt !== undefined ? overrideCourt : (currentCase.courtName || 'DJ'),
          district: 'Prayagraj',
        });
      }
      return acc;
    }, []);

    return processed;
  }, [prisonerResult, localWarrantOverrides, localStatusOverrides, localCourtOverrides]);

  // Warrant Radio Change Handler
  const handleWarrantSelect = (caseKey, value) => {
    setLocalWarrantOverrides((prev) => ({
      ...prev,
      [caseKey]: value,
    }));
  };

  // Court Input Change Handler
  const handleCourtInputChange = (e, caseKey) => {
    const value = e.target.value;
    setLocalCourtOverrides((prev) => ({
      ...prev,
      [caseKey]: value,
    }));
    setActiveCourtDropdown(caseKey);
  };

  // Court Suggestion Click Handler
  const handleCourtSelect = (caseKey, courtName) => {
    setLocalCourtOverrides((prev) => ({
      ...prev,
      [caseKey]: courtName,
    }));
    setActiveCourtDropdown(null);
  };

  const handleStatusChange = (e, caseItem) => {
    e.stopPropagation();
    const caseKey = caseItem.id || caseItem.firNo;
    setLocalStatusOverrides((prev) => ({
      ...prev,
      [caseKey]: e.target.value === 'riha',
    }));
  };

  // Direct Database Posting Handler
  const handlePostEntries = async (e) => {
    e.preventDefault();
    if (selectedCaseIds.length === 0) {
      dispatch(setErrorMsg('Please select at least one FIR entry to feed.'));
      return;
    }

    const prisonerName = prisonerResult.prisonerName || prisonerResult.full_name || prisonerResult.name || 'N/A';
    const fatherName = prisonerResult.fatherName || prisonerResult.father_name || prisonerResult.guardianName || 'N/A';
    const utNo = prisonerResult.utNumber || prisonerResult.ut_code || prisonerResult.utNo || '3857/26';

    const candidateEntries = uniqueCases
      .filter((c) => selectedCaseIds.includes(c.id || c.firNo))
      .map((c) => ({
        utNumber: utNo,
        prisonerName: prisonerName,
        fatherName: fatherName,
        barrack: prisonerResult.barrack || '6-B',
        firNumber: c.firNo || 'N/A',
        actSection: c.actSection || '167/187',
        hearingDate: selectedDate || new Date().toISOString().split('T')[0],
        appearanceMode: subOption === 'vc' ? 'VC' : 'SESSION_ADALAT',
        actionCategory: mainAction || 'Jail Adalat',
        attended: true,
        nonAttendanceReason: 'N/A',
        remarks: '',
        courtName: c.courtName || 'DJ',
        district: c.district || 'Prayagraj',
        custodyStatus: c.isRiha ? 'RIHA' : 'ACTIVE_CUSTODY',
        warrantType: sanitizeWarrantType(c.warrantType),
        
        id: `${utNo}-${c.firNo}`,
        ut_code: utNo,
        full_name: prisonerName,
        father_name: fatherName,
        fir_number: c.firNo,
        legal_provision: sanitizeWarrantType(c.warrantType),
        sub_option: subOption,
        is_riha: c.isRiha,
        created_at: new Date().toLocaleTimeString(),
      }));

    const newUniqueEntries = candidateEntries.filter((candidate) => {
      const alreadyExistsInHistory = historyRecords.some(
        (existing) => 
          (existing.utNumber || existing.ut_code) === candidate.utNumber && 
          (existing.firNumber || existing.fir_number) === candidate.firNumber
      );
      return !alreadyExistsInHistory;
    });

    if (newUniqueEntries.length === 0) {
      dispatch(setErrorMsg('Selected entry/entries already exist in the History Log!'));
      return;
    }

    try {
      setIsSubmitting(true);
      
      const res = await postAdalatEntries(newUniqueEntries);

      if (res && res.success !== false) {
        dispatch(addHistoryEntries(newUniqueEntries));
        dispatch(
          setSubmitSuccess(
            `${newUniqueEntries.length} unique entry(s) successfully synced to database!`
          )
        );
      }
    } catch (error) {
      console.error('Error posting entries to backend:', error);
      dispatch(setErrorMsg(error.response?.data?.message || error.message || 'Failed to sync with database'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentUtNo = prisonerResult?.utNumber || prisonerResult?.ut_code || prisonerResult?.utNo || '3857/26';
  const currentPrisonerName = prisonerResult?.prisonerName || prisonerResult?.full_name || prisonerResult?.name || 'ANIL MAURYA';
  const currentFatherName = prisonerResult?.fatherName || prisonerResult?.father_name || prisonerResult?.guardianName || 'DAYARAM MAURYA';

  return (
    <div className="space-y-4">
      {/* Toast Notification Renderer */}
      <Toast
        key={toast.key}
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* Top Combined Operational Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        
        {/* Left Column: Search Control Card */}
        <div className="xl:col-span-5 bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Jail Adalat Data Feeding & Inmate Lookup
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Search by UT No / Prisoner Name / Father Name / FIR No.
            </p>
          </div>

          {/* Search Mode Tabs */}
          <div className="flex border-b border-slate-800 gap-2 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => dispatch(setSearchTab('ut'))}
              className={`pb-1.5 px-3 border-b-2 font-semibold transition cursor-pointer ${
                searchTab === 'ut'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              UT No.
            </button>
            <button
              type="button"
              onClick={() => dispatch(setSearchTab('name'))}
              className={`pb-1.5 px-3 border-b-2 font-semibold transition cursor-pointer ${
                searchTab === 'name'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Name
            </button>
            <button
              type="button"
              onClick={() => dispatch(setSearchTab('crime'))}
              className={`pb-1.5 px-3 border-b-2 font-semibold transition cursor-pointer ${
                searchTab === 'crime'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Crime / FIR
            </button>
          </div>

          {/* Dynamic Search Form Input */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            {searchTab === 'ut' && (
              <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex-1 focus-within:border-red-500 transition">
                <span className="text-[11px] text-slate-500 font-mono">UT:</span>
                <input
                  type="number"
                  min="1"
                  max="99999"
                  placeholder="3857"
                  value={part1 || ''}
                  onChange={(e) => dispatch(setPart1(e.target.value))}
                  className="bg-transparent text-xs text-white font-mono focus:outline-none w-full text-center placeholder-slate-600"
                  required
                />
                <span className="text-slate-600 font-bold">/</span>
                <input
                  type="number"
                  min="24"
                  max="99"
                  placeholder="26"
                  value={part2 || ''}
                  onChange={(e) => dispatch(setPart2(e.target.value))}
                  className="bg-transparent text-xs text-white font-mono focus:outline-none w-14 text-center placeholder-slate-600"
                  required
                />
              </div>
            )}

            {searchTab === 'name' && (
              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex-1 focus-within:border-red-500 transition">
                <span className="text-[11px] text-slate-500 font-mono">Name:</span>
                <input
                  type="text"
                  placeholder="Ex. Anil Maurya"
                  value={searchName || ''}
                  onChange={(e) => dispatch(setSearchName(e.target.value))}
                  className="bg-transparent text-xs text-white font-mono focus:outline-none w-full placeholder-slate-600"
                  required
                />
              </div>
            )}

            {searchTab === 'crime' && (
              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex-1 focus-within:border-red-500 transition">
                <span className="text-[11px] text-slate-500 font-mono">FIR:</span>
                <input
                  type="text"
                  placeholder="Ex. 142/26"
                  value={searchCrime || ''}
                  onChange={(e) => dispatch(setSearchCrime(e.target.value))}
                  className="bg-transparent text-xs text-white font-mono focus:outline-none w-full placeholder-slate-600"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-medium px-4 py-2.5 rounded-lg text-xs transition shadow-md cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? 'Fetching...' : 'Fetch Record'}
            </button>
          </form>
        </div>

        {/* Right Column: Inmate Quick GUI Profile */}
        {prisonerResult && (
          <div className="xl:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-3">
            
            {/* Inmate Personal Details GUI Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-wide">
                  {currentPrisonerName}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  S/o {currentFatherName}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300">
                  Gender: <span className="text-white font-bold">{prisonerResult.gender || 'M'}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300">
                  Age: <span className="text-white font-bold">{prisonerResult.age || '30'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Action Bar: Submit Button & ID Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <button
                onClick={handlePostEntries}
                disabled={selectedCaseIds.length === 0 || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white disabled:text-slate-500 font-bold px-4 py-2 rounded-lg text-xs transition shadow-lg cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 border border-emerald-500/30"
              >
                <span>{isSubmitting ? 'Posting to DB...' : `Feed Selected (${selectedCaseIds.length}) Entries`}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-red-950/80 text-red-400 border border-red-800 px-2.5 py-1 rounded-md shadow-sm">
                  UT No: {currentUtNo}
                </span>
                <span className="text-xs font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-md">
                  Barrack: {prisonerResult.barrack || '6-B'}
                </span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Prisoner Case Records Tabular Display */}
      {prisonerResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-3 p-4 animate-fadeIn">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
            <span>Pending FIR / Case Records ({uniqueCases.length})</span>
            <span className="text-emerald-400">
              Click row to select • Type court name or pick warrant radio options
            </span>
          </div>

          <div className="max-h-[380px] overflow-y-auto overflow-x-auto rounded-lg border border-slate-800 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-950 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-700">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead className="sticky top-0 z-20">
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono shadow-md">
                  <th className="p-3">UT No.</th>
                  <th className="p-3">Prisoner Name</th>
                  <th className="p-3">Father Name</th>
                  <th className="p-3">Crime / FIR Number</th>
                  <th className="p-3">Under Sections</th>
                  <th className="p-3">Police Station</th>
                  <th className="p-3">Pending Court</th>
                  <th className="p-3 text-center">Warrant Type</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {uniqueCases.map((c, index) => {
                  const caseId = c.id || c.firNo || index;
                  const isChecked = selectedCaseIds.includes(caseId);
                  const activeWarrant = sanitizeWarrantType(c.warrantType);

                  // Filter court suggestions based on user input
                  const currentCourtVal = c.courtName || 'DJ';
                  const matchingCourts = prayagrajCourts.filter(court =>
                    court.toLowerCase().includes(currentCourtVal.toLowerCase())
                  );

                  return (
                    <tr
                      key={caseId}
                      onClick={() => dispatch(toggleSelectCase(caseId))}
                      className={`cursor-pointer transition hover:bg-slate-800/60 ${
                        isChecked
                          ? 'bg-red-950/30 border-l-4 border-l-red-500'
                          : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <td className="p-3 text-red-400 font-bold whitespace-nowrap">{currentUtNo}</td>
                      <td className="p-3 text-white font-bold whitespace-nowrap">{currentPrisonerName}</td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">{currentFatherName}</td>
                      <td className="p-3 text-red-400 font-bold">{c.firNo}</td>
                      <td className="p-3 text-slate-300">{c.actSection}</td>
                      <td className="p-3 text-slate-300 font-sans">{c.psName}</td>
                      
                      {/* Pending Court Keyboard Input with Autocomplete Suggestions */}
                      <td className="p-3 text-slate-300 font-sans relative" onClick={(e) => e.stopPropagation()} ref={courtDropdownRef}>
                        <input
                          type="text"
                          value={currentCourtVal}
                          onChange={(e) => handleCourtInputChange(e, caseId)}
                          onFocus={() => setActiveCourtDropdown(caseId)}
                          placeholder="Type court name..."
                          className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-indigo-300 px-2 py-1 rounded text-[10px] font-bold transition focus:outline-none w-[150px]"
                        />
                        {activeCourtDropdown === caseId && matchingCourts.length > 0 && (
                          <div className="absolute left-3 top-12 z-50 bg-slate-950 border border-slate-700 rounded-md shadow-2xl max-h-48 overflow-y-auto w-48 py-1">
                            {matchingCourts.map((court) => (
                              <div
                                key={court}
                                onClick={() => handleCourtSelect(caseId, court)}
                                className="px-3 py-1.5 text-[10px] text-slate-200 hover:bg-indigo-600 hover:text-white cursor-pointer transition"
                              >
                                {court}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Warrant Type Radio Select Buttons */}
                      <td className="p-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center bg-slate-950 border border-slate-800 rounded p-0.5 gap-0.5">
                          {['167/187', '209/232', '309/346'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleWarrantSelect(caseId, type)}
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition cursor-pointer ${
                                activeWarrant === type
                                  ? 'bg-amber-500 text-slate-950 shadow'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={c.isRiha ? 'riha' : 'active'}
                          onChange={(e) => handleStatusChange(e, c)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition focus:outline-none cursor-pointer ${
                            c.isRiha
                              ? 'bg-emerald-950/90 border-emerald-800 text-emerald-300 focus:border-emerald-500'
                              : 'bg-red-950/90 border-red-900 text-red-300 focus:border-red-500'
                          }`}
                        >
                          <option value="active" className="bg-slate-900 text-red-300">
                           IN JAIL
                          </option>
                          <option value="riha" className="bg-slate-900 text-emerald-300">
                            RIHA 
                          </option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSection;