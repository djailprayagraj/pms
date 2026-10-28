import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setMainAction,
  setSubOption,
  setSelectedDate,
} from '../../redux/slices/adalatSlice';

const DashboardHeader = () => {
  const dispatch = useDispatch();
  const dateInputRef = useRef(null);

  // Extract values directly from Redux store
  const {
    mainAction,
    subOption,
    selectedDate,
  } = useSelector((state) => state.adalat || {});

  // Handler for changing main category to reset sub-options cleanly in Redux
  const handleMainActionChange = (action) => {
    dispatch(setMainAction(action));
  };

  // Trigger calendar picker on icon or input container click
  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  // Get dynamic options for Column 2 based on Column 1
  const getSubOptionsList = () => {
    switch (mainAction) {
      case 'adalat':
        return [
          { id: 'session', label: 'Session' },
          { id: 'vc', label: 'Virtual (VC)' }
        ];
      case 'rihaai':
        return [
          { id: 'bail', label: 'Bail Release' },
          { id: 'parole', label: 'Parole / Furlough' },
          { id: 'term', label: 'Sentence Complete' }
        ];
      case 'sansodhan':
        return [
          { id: 'personal', label: 'Personal Info' },
          { id: 'warrant', label: 'Warrant Update' }
        ];
      default:
        return [];
    }
  };

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 z-30 sticky top-0 shadow-lg">
      
      {/* 4 Imaginary Columns Layout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        
        {/* ================= COLUMN 1: Main Action Radios ================= */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
            1. Action Category
          </span>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'adalat', label: 'Adalat' },
              { id: 'rihaai', label: 'Rihaai' },
              { id: 'sansodhan', label: 'Sansodhan' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMainActionChange(item.id)}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition cursor-pointer text-center ${
                  mainAction === item.id 
                    ? 'bg-red-600 text-white shadow-md font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= COLUMN 2: Dynamic Sub-Options Radios ================= */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">2. Sub-Category / Type</span>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            {getSubOptionsList().map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => dispatch(setSubOption(item.id))}
                className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-mono tracking-wide transition cursor-pointer text-center truncate ${
                  subOption === item.id 
                    ? 'bg-red-600 text-white shadow-md font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= COLUMN 3: Date Picker with SINGLE Custom Icon ================= */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">3. Execution Date</span>
          <div 
            onClick={handleCalendarClick}
            className="relative flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 focus-within:border-red-600 transition cursor-pointer"
          >
            <input 
              ref={dateInputRef}
              type="date"
              value={selectedDate || ''}
              onChange={(e) => dispatch(setSelectedDate(e.target.value))}
              className="w-full bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
            />
            {/* Single Interactive Calendar Icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCalendarClick();
              }}
              className="text-slate-400 hover:text-red-400 transition ml-2 cursor-pointer focus:outline-none flex-shrink-0"
              title="Click to change date"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ================= COLUMN 4: Logged In User Details ================= */}
        <div className="flex items-center justify-end space-x-3 pt-2 lg:pt-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-white">Superintendent Mrs. Amita Dubey</div>
            <div className="text-[10px] text-red-400 font-mono">Admin Security</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-red-950 border border-red-800 flex items-center justify-center text-xs font-bold text-red-200 shadow-md font-mono flex-shrink-0">
            AD
          </div>
        </div>

      </div>

    </header>
  );
};

export default DashboardHeader;