import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setSearchTab,
  setPart1,
  setPart2,
  setSearchCrime,
  addHistoryEntries,
  setSubmitSuccess,
  setErrorMsg,
} from '../../../redux/slices/adalatSlice';
import Toast from '../../Popups/Toast';
import { postAdalatEntries } from '../../../api/adalatService';
import NameAndFatherNameSearch from './NameAndFatherNameSearch';
import PendingCaseItem from './PendingCaseItem';

const SearchSection = ({ handleSearch }) => {
  const dispatch = useDispatch();

  const searchTab = useSelector((state) => state.adalat?.searchTab);
  const part1 = useSelector((state) => state.adalat?.part1);
  const part2 = useSelector((state) => state.adalat?.part2);
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '', key: 0 });

  // Map to store inline row modifications keyed by specific caseId
  const [modifiedCases, setModifiedCases] = useState({});

  const showToast = (type, title, message) => {
    setToast({ show: true, type, title, message, key: Date.now() });
  };

  useEffect(() => {
    if (errorMsg) {
      showToast('error', 'Validation Error', errorMsg);
      dispatch(setErrorMsg(null));
    }
  }, [errorMsg, dispatch]);

  useEffect(() => {
    if (submitSuccess) {
      showToast('success', 'Operation Successful', submitSuccess);
      dispatch(setSubmitSuccess(null));
    }
  }, [submitSuccess, dispatch]);

  const uniqueCases = React.useMemo(() => {
    const sourceList = prisonerResult?.rawData || prisonerResult?.cases || [];
    
    const processedCases = sourceList.reduce((acc, currentCase) => {
      const rawFir = currentCase.firNo || currentCase['FIR/Case No'] || currentCase.fir_number || '';
      const normalizedFir = rawFir.toString().trim().replace(/^(fir|cr|case)\s*[-:]?/i, '').replace(/[\s-]+/g, '').toUpperCase();
      
      const utNo = currentCase.RegisterNo || currentCase.utNumber || currentCase.ut_code || 'N/A';
      const indvPrisonerName = currentCase['Prisoner Name'] || currentCase.prisonerName || currentCase.full_name || 'N/A';
      const indvFatherName = currentCase['Father Name'] || currentCase.fatherName || currentCase.father_name || 'N/A';
      const actSectionVal = currentCase['Act Section'] || currentCase.actSection || currentCase.act_section || 'N/A';

      const extractedWarrantType =
        currentCase.warrantType ||
        currentCase.warrant_type ||
        currentCase['Action Code'] ||
        '167/187';

      const isDuplicate = acc.some((item) => {
        const itemFir = (item.firNo || item['FIR/Case No'] || item.fir_number || '').toString().trim().replace(/^(fir|cr|case)\s*[-:]?/i, '').replace(/[\s-]+/g, '').toUpperCase();
        const itemUt = item.RegisterNo || item.utNumber || item.ut_code || 'N/A';
        return itemUt === utNo && itemFir === normalizedFir;
      });

      if (!isDuplicate) {
        acc.push({
          ...currentCase,
          firNo: rawFir,
          utNumber: utNo,
          prisonerName: indvPrisonerName,
          fatherName: indvFatherName,
          actSection: actSectionVal,
          psName: currentCase['PS Name'] || currentCase.psName || currentCase.police_station || 'N/A',
          district: 'Prayagraj',
          warrantType: extractedWarrantType,
          courtName: currentCase.CourtName || currentCase['Court Name'] || currentCase.courtName || currentCase.JudgeName || 'DJ',
        });
      }
      return acc;
    }, []);

    // Append a fully blank/editable custom row at the bottom for new Talbi entries (unselected by default)
    if (prisonerResult) {
      const fallbackUt = prisonerResult.utNumber || prisonerResult.ut_code || prisonerResult.utNo || '';
      const fallbackName = prisonerResult.prisonerName || prisonerResult.full_name || prisonerResult.name || '';
      const fallbackFather = prisonerResult.fatherName || prisonerResult.father_name || prisonerResult.guardianName || '';
      const blankCaseId = `custom-blank-${fallbackUt || 'new'}`;

      const userEdits = modifiedCases[blankCaseId] || {};

      processedCases.push({
        id: blankCaseId,
        firNo: userEdits.firNo !== undefined ? userEdits.firNo : '',
        utNumber: userEdits.utNumber !== undefined ? userEdits.utNumber : fallbackUt,
        prisonerName: userEdits.prisonerName !== undefined ? userEdits.prisonerName : fallbackName,
        fatherName: userEdits.fatherName !== undefined ? userEdits.fatherName : fallbackFather,
        actSection: userEdits.actSection !== undefined ? userEdits.actSection : '',
        psName: userEdits.psName !== undefined ? userEdits.psName : '',
        district: 'Prayagraj',
        warrantType: userEdits.warrantType !== undefined ? userEdits.warrantType : '167/187',
        courtName: userEdits.courtName !== undefined ? userEdits.courtName : '',
        isCustomBlank: true,
      });
    }

    return processedCases;
  }, [prisonerResult, modifiedCases]);

  const handleCaseUpdate = (caseId, updatedFields) => {
    setModifiedCases((prev) => ({
      ...prev,
      [caseId]: {
        ...(prev[caseId] || {}),
        ...updatedFields,
      },
    }));
  };

  const handlePostEntries = async (e) => {
    e.preventDefault();
    if (selectedCaseIds.length === 0) {
      dispatch(setErrorMsg('Please select at least one FIR entry to feed.'));
      return;
    }

    const defaultPrisonerName = prisonerResult?.prisonerName || prisonerResult?.full_name || prisonerResult?.name || 'N/A';
    const defaultFatherName = prisonerResult?.fatherName || prisonerResult?.father_name || prisonerResult?.guardianName || 'N/A';
    const defaultUtNo = prisonerResult?.utNumber || prisonerResult?.ut_code || prisonerResult?.utNo || 'N/A';

    const candidateEntries = uniqueCases
      .filter((c) => selectedCaseIds.includes(c.id || `${c.utNumber}-${c.firNo}`))
      .map((c) => {
        const caseId = c.id || `${c.utNumber}-${c.firNo}`;
        const userEdits = modifiedCases[caseId] || {};

        const finalUtNo = userEdits.utNumber !== undefined ? userEdits.utNumber : c.utNumber;
        const finalPrisonerName = userEdits.prisonerName !== undefined ? userEdits.prisonerName : c.prisonerName;
        const finalFatherName = userEdits.fatherName !== undefined ? userEdits.fatherName : c.fatherName;
        const finalFir = userEdits.firNo !== undefined ? userEdits.firNo : c.firNo;
        const finalActSection = userEdits.actSection !== undefined ? userEdits.actSection : c.actSection;
        const finalPsName = userEdits.psName !== undefined ? userEdits.psName : c.psName;
        const finalCourtName = userEdits.courtName || c.courtName || 'DJ';
        const finalWarrantType = userEdits.warrantType || c.warrantType || '167/187';
        const finalIsRiha = userEdits.isRiha !== undefined ? userEdits.isRiha : Boolean(c.isRiha);

        if (c.isCustomBlank && (!finalFir || finalFir.trim() === '')) {
          throw new Error('Please enter a valid FIR/Case Number for the new Talbi entry.');
        }

        return {
          utNumber: finalUtNo || defaultUtNo,
          prisonerName: finalPrisonerName || defaultPrisonerName,
          fatherName: finalFatherName || defaultFatherName,
          barrack: c.barrack || prisonerResult.barrack || 'N/A',
          firNumber: finalFir || 'N/A',
          actSection: finalActSection || 'N/A',
          psName: finalPsName || 'N/A',
          hearingDate: selectedDate || new Date().toISOString().split('T')[0],
          appearanceMode: subOption === 'vc' ? 'VC' : 'SESSION_ADALAT',
          actionCategory: mainAction || 'Jail Adalat',
          attended: true,
          nonAttendanceReason: 'N/A',
          remarks: c.isCustomBlank ? 'New Court/FIR Talbi Entry' : '',
          courtName: finalCourtName,
          district: c.district || 'Prayagraj',
          custodyStatus: finalIsRiha ? 'RIHA' : 'ACTIVE_CUSTODY',
          warrantType: finalWarrantType,
          id: caseId,
          ut_code: finalUtNo || defaultUtNo,
          full_name: finalPrisonerName || defaultPrisonerName,
          father_name: finalFatherName || defaultFatherName,
          fir_number: finalFir,
          legal_provision: finalWarrantType,
          sub_option: subOption,
          is_riha: finalIsRiha,
          created_at: new Date().toLocaleTimeString(),
        };
      });

    const newUniqueEntries = candidateEntries.filter((candidate) => {
      return !historyRecords.some(
        (existing) =>
          (existing.utNumber || existing.ut_code) === candidate.utNumber &&
          (existing.firNumber || existing.fir_number) === candidate.firNumber
      );
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
        dispatch(setSubmitSuccess(`${newUniqueEntries.length} entry(s) successfully synced to database!`));
      }
    } catch (error) {
      console.error('Error posting entries to backend:', error);
      dispatch(setErrorMsg(error.response?.data?.message || error.message || 'Failed to sync with database'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentUtNo = prisonerResult?.utNumber || prisonerResult?.ut_code || prisonerResult?.utNo || '3857/26';
  const currentPrisonerName = prisonerResult?.prisonerName || prisonerResult?.full_name || prisonerResult?.name || 'N/A';
  const currentFatherName = prisonerResult?.fatherName || prisonerResult?.father_name || prisonerResult?.guardianName || 'N/A';

  return (
    <div className="space-y-4">
      <Toast
        key={toast.key}
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-5 bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Jail Adalat Data Feeding & Inmate Lookup
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Search by UT No / Prisoner & Father Name / FIR No.
            </p>
          </div>

          <div className="flex border-b border-slate-800 gap-2 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => dispatch(setSearchTab('ut'))}
              className={`pb-1.5 px-3 border-b-2 font-semibold transition cursor-pointer ${
                searchTab === 'ut' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              UT No.
            </button>
            <button
              type="button"
              onClick={() => dispatch(setSearchTab('name'))}
              className={`pb-1.5 px-3 border-b-2 font-semibold transition cursor-pointer ${
                searchTab === 'name' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Name & Father Name
            </button>
            <button
              type="button"
              onClick={() => dispatch(setSearchTab('crime'))}
              className={`pb-1.5 px-3 border-b-2 font-semibold transition cursor-pointer ${
                searchTab === 'crime' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Crime / FIR
            </button>
          </div>

          {searchTab === 'ut' && (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
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
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-medium px-4 py-2.5 rounded-lg text-xs transition shadow-md cursor-pointer whitespace-nowrap"
              >
                {loading ? 'Fetching...' : 'Fetch Record'}
              </button>
            </form>
          )}

          {searchTab === 'name' && (
            <NameAndFatherNameSearch onExecuteSearch={handleSearch} />
          )}

          {searchTab === 'crime' && (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
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
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-medium px-4 py-2.5 rounded-lg text-xs transition shadow-md cursor-pointer whitespace-nowrap"
              >
                {loading ? 'Fetching...' : 'Fetch Record'}
              </button>
            </form>
          )}
        </div>

        {prisonerResult && (
          <div className="xl:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-3">
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

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <button
                onClick={handlePostEntries}
                disabled={selectedCaseIds.length === 0 || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white disabled:text-slate-500 font-bold px-4 py-2 rounded-lg text-xs transition shadow-lg cursor-pointer flex items-center gap-1.5 border border-emerald-500/30"
              >
                <span>{isSubmitting ? 'Posting to DB...' : `Feed Selected (${selectedCaseIds.length}) Entries`}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-red-950/80 text-red-400 border border-red-800 px-2.5 py-1 rounded-md">
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

      {prisonerResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-3 p-4">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
            <span>Pending FIR / Case Records ({uniqueCases.length})</span>
            <span className="text-emerald-400">Click row or checkbox to select/unselect for feeding</span>
          </div>

          <div className="max-h-[380px] overflow-y-auto overflow-x-auto rounded-lg border border-slate-800">
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
                {uniqueCases.map((c) => {
                  const caseId = c.id || `${c.utNumber}-${c.firNo}`;
                  const isChecked = selectedCaseIds.includes(caseId);

                  return (
                    <PendingCaseItem
                      key={caseId}
                      caseItem={c}
                      isChecked={isChecked}
                      onCaseUpdate={handleCaseUpdate}
                    />
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