import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCourtsList } from '../../../redux/slices/adalatSlice';
import { allCourtsList } from '../../../api/adalatService';

const SelectCourt = ({ value, onChange, placeholder = "Filter Courts..." }) => {
  const dispatch = useDispatch();
  const courtsList = useSelector((state) => state.adalat?.courtsList || []);
  const [loading, setLoading] = useState(false);
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const dropdownRef = useRef(null);

  // Sync internal search input if external `value` changes
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Fetch all courts list on initial component mount if not already in Redux store
  useEffect(() => {
    let isMounted = true;
    const fetchCourts = async () => {
      if (courtsList.length === 0) {
        try {
          setLoading(true);
          const res = await allCourtsList();
          const list = res?.data || res || [];
          if (isMounted) {
            dispatch(setCourtsList(list));
          }
        } catch (error) {
          console.error('Failed to fetch courts list:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchCourts();

    return () => {
      isMounted = false;
    };
  }, [courtsList.length, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter courts based on what the user types (case-insensitive)
  const filteredCourts = courtsList.filter((court) =>
    court.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);
    
    if (onChange) {
      onChange({ target: { value: val } });
    }
  };

  const handleSelectOption = (designation) => {
    setSearchTerm(designation);
    setIsOpen(false);
    if (onChange) {
      onChange({ target: { value: designation } });
    }
  };

  return (
    <div className="relative inline-block text-left  min-w-[250px]" ref={dropdownRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        disabled={loading}
        placeholder={loading ? "Loading courts..." : placeholder}
        className="bg-slate-950 border border-slate-700 focus:border-indigo-500 text-indigo-300 px-3 py-2 rounded-md text-sm font-semibold transition focus:outline-none shadow-sm disabled:opacity-50 w-full min-w-[260px]"
      />

      {isOpen && (
        <div className="absolute left-0 mt-1 w-full min-w-[260px] bg-slate-950 border border-slate-700 rounded-md shadow-xl z-50 max-h-60 overflow-y-auto">
          {filteredCourts.length > 0 ? (
            filteredCourts.map((court) => (
              <div
                key={court._id || court.designation}
                onClick={() => handleSelectOption(court.designation)}
                className="px-3 py-2.5 text-xs text-slate-200 hover:bg-indigo-600 hover:text-white cursor-pointer transition border-b border-slate-900 last:border-none font-medium leading-relaxed"
              >
                {court.designation}
              </div>
            ))
          ) : (
            <div className="px-3 py-3 text-xs text-slate-400 italic">
              No matching courts found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectCourt;