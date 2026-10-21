import React, { useState } from 'react';

const DashboardHeader = () => {
  // Column 1 main choice
  const [mainAction, setMainAction] = useState('adalat'); // 'adalat' | 'rihaai' | 'sansodhan'
  
  // Column 2 dynamic choice based on Column 1
  const [subOption, setSubOption] = useState('session'); 

  // Column 3 persistent date
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Handler for changing main category to reset sub-options cleanly
  const handleMainActionChange = (action) => {
    setMainAction(action);
    if (action === 'adalat') setSubOption('session');
    else if (action === 'rihaai') setSubOption('bail');
    else if (action === 'sansodhan') setSubOption('personal_info');
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
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">1. Action Category</span>
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
                onClick={() => setSubOption(item.id)}
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

        {/* ================= COLUMN 3: Persistent Date Picker ================= */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">3. Execution Date</span>
          <div className="relative">
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-600 cursor-pointer"
            />
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