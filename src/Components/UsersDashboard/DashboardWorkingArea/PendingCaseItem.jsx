import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toggleSelectCase } from '../../../redux/slices/adalatSlice';
import { fetchAdalatByDate } from '../../../api/adalatService';

const sanitizeWarrantType = (val) => {
  const allowed = ['167/187', '209/232', '309/346'];
  const cleaned = typeof val === 'string' ? val.trim() : '';
  return allowed.includes(cleaned) ? cleaned : '167/187';
};

const getFormattedTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const PendingCaseItem = ({ caseItem, isChecked, onCaseUpdate }) => {
  const dispatch = useDispatch();
  const caseId = caseItem.id || `${caseItem.utNumber}-${caseItem.firNo}`;

  const [warrantType, setWarrantType] = useState(() => {
    return sanitizeWarrantType(caseItem.warrantType || caseItem.warrant_type || '167/187');
  });

  const [courtName, setCourtName] = useState(caseItem.courtName || caseItem.court_name || 'N/A');
  const [isRiha, setIsRiha] = useState(
    Boolean(caseItem.isRiha || caseItem.is_riha || caseItem.custodyStatus === 'RIHA')
  );

  // Read existing case details from database on mount for present-day records
  useEffect(() => {
    let isMounted = true;

    const loadDirectFromDb = async () => {
      try {
        const targetUt = caseItem.utNumber;
        const targetFir = caseItem.firNo || caseItem.firNumber;

        if (!targetUt || targetUt === 'N/A') return;

        const currentDate = caseItem.hearingDate
          ? new Date(caseItem.hearingDate).toISOString().split('T')[0]
          : getFormattedTodayDate();

        const response = await fetchAdalatByDate(currentDate);
        const adalatList = response?.data || response || [];

        const matchedLog = adalatList.find((entry) => {
          const matchUt = String(entry.utNumber).trim() === String(targetUt).trim();
          const matchFir = targetFir
            ? String(entry.firNumber || entry.firNo).trim() === String(targetFir).trim()
            : true;
          return matchUt && matchFir;
        });

        if (matchedLog && isMounted) {
          if (matchedLog.warrantType) {
            const sanitized = sanitizeWarrantType(matchedLog.warrantType);
            setWarrantType(sanitized);
          }
          if (matchedLog.courtName) {
            setCourtName(matchedLog.courtName);
          }
          if (matchedLog.custodyStatus !== undefined) {
            setIsRiha(matchedLog.custodyStatus === 'RIHA');
          }
        }
      } catch (error) {
        console.error('Failed to fetch individual record via fetchAdalatByDate:', error);
      }
    };

    loadDirectFromDb();

    return () => {
      isMounted = false;
    };
  }, [caseItem]);

  // Sync edits to parent state without sending network requests
  const handleWarrantChange = (type) => {
    setWarrantType(type);
    if (onCaseUpdate) {
      onCaseUpdate(caseId, { warrantType: type });
    }
  };

  const handleCourtChange = (e) => {
    const val = e.target.value;
    setCourtName(val);
    if (onCaseUpdate) {
      onCaseUpdate(caseId, { courtName: val });
    }
  };

  const handleStatusChange = (e) => {
    e.stopPropagation();
    const newStatus = e.target.value === 'riha';
    setIsRiha(newStatus);
    if (onCaseUpdate) {
      onCaseUpdate(caseId, { isRiha: newStatus });
    }
  };

  return (
    <tr
      onClick={() => dispatch(toggleSelectCase(caseId))}
      className={`cursor-pointer transition hover:bg-slate-800/60 ${
        isChecked ? 'bg-red-950/35 border-l-4 border-l-red-500' : ''
      }`}
    >
      {/* 1st Column: UT Number */}
      <td className="p-3 text-red-400 font-bold whitespace-nowrap">{caseItem.utNumber}</td>
      <td className="p-3 text-white font-bold whitespace-nowrap">{caseItem.prisonerName}</td>
      <td className="p-3 text-slate-300 whitespace-nowrap">{caseItem.fatherName}</td>
      <td className="p-3 text-red-400 font-bold">{caseItem.firNo || caseItem.firNumber}</td>
      <td className="p-3 text-slate-300">{caseItem.actSection}</td>
      <td className="p-3 text-slate-300 font-sans">{caseItem.psName}</td>

      {/* Pending Court Input Field */}
      <td className="p-3 text-slate-300 font-sans relative" onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          value={courtName}
          onChange={handleCourtChange}
          placeholder="Type court name..."
          className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-indigo-300 px-2 py-1 rounded text-[10px] font-bold transition focus:outline-none w-[150px]"
        />
      </td>

      {/* Warrant Type Radio Select Buttons */}
      <td className="p-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="inline-flex items-center bg-slate-950 border border-slate-800 rounded p-0.5 gap-0.5">
          {['167/187', '209/232', '309/346'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleWarrantChange(type)}
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition cursor-pointer ${
                warrantType === type ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </td>

      {/* Status Select (IN JAIL / RIHA) */}
      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
        <select
          value={isRiha ? 'riha' : 'active'}
          onChange={handleStatusChange}
          className={`px-2 py-1 rounded text-[10px] font-bold border transition focus:outline-none cursor-pointer ${
            isRiha ? 'bg-emerald-950/90 border-emerald-800 text-emerald-300' : 'bg-red-950/90 border-red-900 text-red-300'
          }`}
        >
          <option value="active" className="bg-slate-900 text-red-300">IN JAIL</option>
          <option value="riha" className="bg-slate-900 text-emerald-300">RIHA</option>
        </select>
      </td>
    </tr>
  );
};

export default PendingCaseItem;