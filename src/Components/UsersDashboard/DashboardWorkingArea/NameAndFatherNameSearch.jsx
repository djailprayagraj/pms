import React, { useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchName } from '../../../redux/slices/adalatSlice';

const NameAndFatherNameSearch = ({ onExecuteSearch }) => {
  const dispatch = useDispatch();
  
  const currentSearchName = useSelector((state) => state.adalat?.searchName || '');
  
  const [prisonerNameInput, setPrisonerNameInput] = useState(currentSearchName);
  const [fatherNameInput, setFatherNameInput] = useState('');

  // Throttle ref to prevent spam clicks (min 1.5 seconds between executions)
  const lastExecutedRef = useRef(0);
  const THROTTLE_LIMIT = 1500; 

  const throttledSearchTrigger = useCallback((nameVal, fatherVal) => {
    const now = Date.now();
    if (now - lastExecutedRef.current >= THROTTLE_LIMIT) {
      lastExecutedRef.current = now;
      
      const combinedQuery = fatherVal.trim() 
        ? `${nameVal.trim()} s/o ${fatherVal.trim()}` 
        : nameVal.trim();
      
      dispatch(setSearchName(combinedQuery));
      if (typeof onExecuteSearch === 'function') {
        onExecuteSearch();
      }
    }
  }, [dispatch, onExecuteSearch]);

  // Handle explicit form submit only
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!prisonerNameInput.trim()) return;
    throttledSearchTrigger(prisonerNameInput, fatherNameInput);
  };

  return (
    <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row items-stretch gap-2 flex-1">
      {/* Prisoner Name Input */}
      <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex-1 focus-within:border-red-500 transition">
        <span className="text-[11px] text-slate-500 font-mono">Name:</span>
        <input
          type="text"
          placeholder="Ex. Anil Maurya"
          value={prisonerNameInput}
          onChange={(e) => setPrisonerNameInput(e.target.value)}
          className="bg-transparent text-xs text-white font-mono focus:outline-none w-full placeholder-slate-600"
          required
        />
      </div>

      {/* Father Name Input */}
      <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex-1 focus-within:border-red-500 transition">
        <span className="text-[11px] text-slate-500 font-mono">Father:</span>
        <input
          type="text"
          placeholder="Ex. Dayaram Maurya"
          value={fatherNameInput}
          onChange={(e) => setFatherNameInput(e.target.value)}
          className="bg-transparent text-xs text-white font-mono focus:outline-none w-full placeholder-slate-600"
        />
      </div>

      {/* Submit Button (no onClick needed, relies entirely on form onSubmit) */}
      <button
        type="submit"
        className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-lg text-xs transition shadow-md cursor-pointer whitespace-nowrap"
      >
        Search Name
      </button>
    </form>
  );
};

export default NameAndFatherNameSearch;