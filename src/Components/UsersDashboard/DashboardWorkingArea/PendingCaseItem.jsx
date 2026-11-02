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
  const isBlankRow = Boolean(caseItem.isCustomBlank);

  const [warrantType, setWarrantType] = useState(() => {
    return sanitizeWarrantType(caseItem.warrantType || caseItem.warrant_type || '167/187');
  });

  const [courtName, setCourtName] = useState(caseItem.courtName || caseItem.court_name || 'N/A');
  const [isRiha, setIsRiha] = useState(
    Boolean(caseItem.isRiha || caseItem.is_riha || caseItem.custodyStatus === 'RIHA')
  );

  // Local state inputs specifically for the custom blank row
  const [blankUtNumber, setBlankUtNumber] = useState(caseItem.utNumber || '');
  const [blankPrisonerName, setBlankPrisonerName] = useState(caseItem.prisonerName || '');
  const [blankFatherName, setBlankFatherName] = useState(caseItem.fatherName || '');
  const [blankFirNo, setBlankFirNo] = useState(caseItem.firNo || '');
  const [blankActSection, setBlankActSection] = useState(caseItem.actSection || '');
  const [blankPsName, setBlankPsName] = useState(caseItem.psName || '');

  // Read existing case details from database on mount for present-day records (non-blank rows)
  useEffect(() => {
    if (isBlankRow) return;
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
  }, [caseItem, isBlankRow]);

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

  const handleBlankChange = (field, value, setStateFn) => {
    setStateFn(value);
    if (onCaseUpdate) {
      onCaseUpdate(caseId, { [field]: value });
    }
  };

  const handleRowClick = (e) => {
    // Prevent triggering selection toggle if clicking directly inside an input or select
    if (['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA'].includes(e.target.tagName)) {
      return;
    }
    dispatch(toggleSelectCase(caseId));
  };

  return (
    <tr
      onClick={handleRowClick}
      className={`cursor-pointer transition ${
        isChecked
          ? 'bg-red-950/35 border-l-4 border-l-red-500'
          : isBlankRow
          ? 'bg-amber-950/20 hover:bg-amber-900/30 text-amber-200 border-l-4 border-l-amber-500'
          : 'hover:bg-slate-800/60'
      }`}
    >
      {/* UT Number */}
      <td className="p-3 whitespace-nowrap">
        {isBlankRow ? (
          <input
            type="text"
            value={blankUtNumber}
            onChange={(e) => handleBlankChange('utNumber', e.target.value, setBlankUtNumber)}
            placeholder="UT No"
            className="bg-slate-950 border border-slate-700 focus:border-amber-500 text-white px-2 py-1 rounded text-xs font-mono font-bold w-[90px] focus:outline-none"
          />
        ) : (
          <span className="text-red-400 font-bold">{caseItem.utNumber}</span>
        )}
      </td>

      {/* Prisoner Name */}
      <td className="p-3 whitespace-nowrap">
        {isBlankRow ? (
          <input
            type="text"
            value={blankPrisonerName}
            onChange={(e) => handleBlankChange('prisonerName', e.target.value, setBlankPrisonerName)}
            placeholder="Prisoner Name"
            className="bg-slate-950 border border-slate-700 focus:border-amber-500 text-white px-2 py-1 rounded text-xs font-bold w-[130px] focus:outline-none"
          />
        ) : (
          <span className="text-white font-bold">{caseItem.prisonerName}</span>
        )}
      </td>

      {/* Father Name */}
      <td className="p-3 whitespace-nowrap">
        {isBlankRow ? (
          <input
            type="text"
            value={blankFatherName}
            onChange={(e) => handleBlankChange('fatherName', e.target.value, setBlankFatherName)}
            placeholder="Father Name"
            className="bg-slate-950 border border-slate-700 focus:border-amber-500 text-slate-200 px-2 py-1 rounded text-xs w-[120px] focus:outline-none"
          />
        ) : (
          <span className="text-slate-300">{caseItem.fatherName}</span>
        )}
      </td>

      {/* Crime / FIR Number */}
      <td className="p-3 whitespace-nowrap">
        {isBlankRow ? (
          <input
            type="text"
            value={blankFirNo}
            onChange={(e) => handleBlankChange('firNo', e.target.value, setBlankFirNo)}
            placeholder="Ex. 142/26"
            className="bg-slate-950 border border-amber-500/80 focus:border-amber-400 text-amber-300 px-2 py-1 rounded text-xs font-bold w-[110px] focus:outline-none"
          />
        ) : (
          <span className="text-red-400 font-bold">{caseItem.firNo || caseItem.firNumber}</span>
        )}
      </td>

      {/* Under Sections */}
      <td className="p-3 whitespace-nowrap">
        {isBlankRow ? (
          <input
            type="text"
            value={blankActSection}
            onChange={(e) => handleBlankChange('actSection', e.target.value, setBlankActSection)}
            placeholder="Ex. 302/34 IPC"
            className="bg-slate-950 border border-slate-700 focus:border-amber-500 text-slate-200 px-2 py-1 rounded text-xs w-[110px] focus:outline-none"
          />
        ) : (
          <span className="text-slate-300">{caseItem.actSection}</span>
        )}
      </td>

      {/* Police Station */}
      <td className="p-3 whitespace-nowrap font-sans">
        {isBlankRow ? (
          <input
            type="text"
            value={blankPsName}
            onChange={(e) => handleBlankChange('psName', e.target.value, setBlankPsName)}
            placeholder="Ex. Civil Lines"
            className="bg-slate-950 border border-slate-700 focus:border-amber-500 text-slate-200 px-2 py-1 rounded text-xs w-[110px] focus:outline-none"
          />
        ) : (
          <span className="text-slate-300">{caseItem.psName}</span>
        )}
      </td>

      {/* Pending Court Input Field */}
      <td className="p-3 text-slate-300 font-sans relative">
        <input
          type="text"
          value={courtName}
          onChange={handleCourtChange}
          placeholder="Type court name..."
          className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-indigo-300 px-2 py-1 rounded text-[10px] font-bold transition focus:outline-none w-[130px]"
        />
      </td>

      {/* Warrant Type Buttons */}
      <td className="p-3 text-center whitespace-nowrap">
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

      {/* Status Select (IN JAIL / RIHA) & Selection Checkbox / Indicator */}
      <td className="p-3 text-center">
        <div className="flex items-center justify-center gap-2">
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

          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => dispatch(toggleSelectCase(caseId))}
            className="w-4 h-4 accent-red-500 rounded cursor-pointer"
          />
        </div>
      </td>
    </tr>
  );
};

export default PendingCaseItem;