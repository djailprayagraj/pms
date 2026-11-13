import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNextHearingRecords, updateNextHearingDate } from '../../api/adalatService';
import { setErrorMsg, setSubmitSuccess } from '../../redux/slices/adalatSlice';
import Toast from '../Popups/Toast';

const NextHearingDate = () => {
  const dispatch = useDispatch();

  // Global Redux toast triggers (syncs if any child/slice action fires)
  const reduxErrorMsg = useSelector((state) => state.adalat?.errorMsg);
  const reduxSubmitSuccess = useSelector((state) => state.adalat?.submitSuccess);

  // Local Toast State
  const [toast, setToast] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    key: 0,
  });

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [utFilter, setUtFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');

  // Data & Loading States
  const [hearingList, setHearingList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal / Reschedule State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newDateVal, setNewDateVal] = useState('');
  const [remarksVal, setRemarksVal] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const triggerToast = useCallback((type, title, message) => {
    setToast({
      show: true,
      type,
      title,
      message,
      key: Date.now(),
    });
  }, []);

  // Centralized HTTP & API Error Interpreter
  const handleApiError = useCallback(
    (err, fallbackMsg = 'An unexpected error occurred.') => {
      if (!err.response) {
        triggerToast(
          'error',
          'Network Offline (ERR_NETWORK)',
          'Unable to reach the server. Verify your LAN connection or backend service.'
        );
        return;
      }

      const status = err.response.status;
      const serverMessage = err.response.data?.message || err.message || fallbackMsg;

      switch (status) {
        case 400:
          triggerToast('warning', `Validation Error (400)`, serverMessage);
          break;
        case 401:
        case 403:
          triggerToast(
            'error',
            `Unauthorized Access (${status})`,
            'Your session has expired or you lack permissions for this action.'
          );
          break;
        case 404:
          triggerToast('warning', `Record Not Found (404)`, serverMessage);
          break;
        case 409:
          triggerToast('warning', `Schedule Conflict (409)`, serverMessage);
          break;
        case 422:
          triggerToast('warning', `Unprocessable Data (422)`, serverMessage);
          break;
        case 500:
        case 502:
        case 503:
          triggerToast(
            'error',
            `Server Failure (${status})`,
            serverMessage || 'Internal database or server error. Contact system administrator.'
          );
          break;
        default:
          triggerToast('error', `Request Failed (${status})`, serverMessage);
      }
    },
    [triggerToast]
  );

  // Sync Redux messages into local Toast if triggered externally
  useEffect(() => {
    if (reduxErrorMsg) {
      triggerToast('error', 'System Alert', reduxErrorMsg);
      dispatch(setErrorMsg(null));
    }
  }, [reduxErrorMsg, dispatch, triggerToast]);

  useEffect(() => {
    if (reduxSubmitSuccess) {
      triggerToast('success', 'Operation Complete', reduxSubmitSuccess);
      dispatch(setSubmitSuccess(null));
    }
  }, [reduxSubmitSuccess, dispatch, triggerToast]);

  // Fetch records based on filters
  const fetchRecords = useCallback(async (isManualSearch = false) => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      triggerToast(
        'warning',
        'Invalid Date Range',
        'Start Date cannot be later than End Date.'
      );
      return;
    }

    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (utFilter.trim()) params.utNumber = utFilter.trim();
      if (nameFilter.trim()) params.prisonerName = nameFilter.trim();

      const res = await getNextHearingRecords(params);
      if (res && res.success) {
        const records = res.data || [];
        setHearingList(records);
        if (isManualSearch) {
          triggerToast(
            'info',
            'Search Complete',
            `Retrieved ${records.length} matching court production record(s).`
          );
        }
      } else {
        setHearingList([]);
        triggerToast(
          'warning',
          'Query Warning',
          res?.message || 'No records returned from server.'
        );
      }
    } catch (err) {
      console.error('Error fetching next hearings:', err);
      handleApiError(err, 'Failed to fetch next hearing records.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, utFilter, nameFilter, triggerToast, handleApiError]);

  useEffect(() => {
    fetchRecords(false);
  }, [startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords(true);
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setUtFilter('');
    setNameFilter('');
    triggerToast('info', 'Filters Cleared', 'Showing all scheduled & pending records.');
    setTimeout(() => {
      getNextHearingRecords({})
        .then((res) => {
          if (res?.success) setHearingList(res.data || []);
        })
        .catch((err) => handleApiError(err));
    }, 0);
  };

  const handleOpenReschedule = (record) => {
    setSelectedRecord(record);
    setNewDateVal(record.nextHearingDate ? record.nextHearingDate.split('T')[0] : '');
    setRemarksVal(record.remarks || '');
  };

  const handleSaveNewDate = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    if (!newDateVal) {
      triggerToast('warning', 'Missing Date', 'Please select a valid next hearing date.');
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        id: selectedRecord._id,
        nextHearingDate: newDateVal,
        remarks: remarksVal.trim() || 'Updated via Next Hearing Dashboard',
      };

      const res = await updateNextHearingDate(payload);
      if (res && res.success) {
        triggerToast(
          'success',
          'Hearing Rescheduled',
          `Next hearing for ${selectedRecord.prisonerName} (${selectedRecord.utNumber}) set to ${new Date(
            newDateVal
          ).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.`
        );
        setSelectedRecord(null);
        setNewDateVal('');
        setRemarksVal('');
        fetchRecords(false);
      } else {
        triggerToast(
          'error',
          'Update Rejected',
          res?.message || 'Could not update hearing date.'
        );
      }
    } catch (error) {
      console.error('Error updating hearing date:', error);
      handleApiError(error, 'Failed to update next hearing date.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Compute summary metrics & date status helper
  const { stats, getDateBadge } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let scheduledToday = 0;
    let upcoming = 0;
    let overdueOrUnset = 0;

    hearingList.forEach((item) => {
      if (!item.nextHearingDate) {
        overdueOrUnset++;
        return;
      }
      const d = new Date(item.nextHearingDate);
      d.setHours(0, 0, 0, 0);

      if (d.getTime() === today.getTime()) scheduledToday++;
      else if (d > today) upcoming++;
      else overdueOrUnset++;
    });

    const badgeHelper = (dateStr) => {
      if (!dateStr) {
        return {
          label: 'NOT SET',
          classes: 'bg-slate-800/80 text-slate-400 border-slate-700',
        };
      }
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);

      if (d.getTime() === today.getTime()) {
        return {
          label: 'TODAY PESHI',
          classes: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50 animate-pulse',
        };
      }
      if (d < today) {
        return {
          label: 'OVERDUE / PAST',
          classes: 'bg-red-950/80 text-red-300 border-red-700/50',
        };
      }
      return {
        label: 'UPCOMING',
        classes: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
      };
    };

    return {
      stats: {
        total: hearingList.length,
        scheduledToday,
        upcoming,
        overdueOrUnset,
      },
      getDateBadge: badgeHelper,
    };
  }, [hearingList]);

  const hasActiveFilters = Boolean(startDate || endDate || utFilter || nameFilter);

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Global Toast Notification */}
      <Toast
        key={toast.key}
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* Top Executive Header & KPI Summary Strip */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/90 rounded-2xl p-5 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-sans font-bold text-white tracking-wide flex items-center gap-2">
                Next Hearing Date Management
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Peshi Tracker
                </span>
              </h2>
              <p className="text-[11px] font-sans text-slate-400 mt-0.5">
                Schedule, filter, and audit upcoming court productions across all judicial benches.
              </p>
            </div>
          </div>

          {/* KPI Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2">
              <div className="text-[10px] text-slate-500 uppercase">Total Listed</div>
              <div className="text-sm font-bold text-white mt-0.5">{stats.total}</div>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl px-3.5 py-2">
              <div className="text-[10px] text-emerald-400/80 uppercase">Today&apos;s Peshi</div>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">{stats.scheduledToday}</div>
            </div>
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl px-3.5 py-2">
              <div className="text-[10px] text-amber-400/80 uppercase">Upcoming</div>
              <div className="text-sm font-bold text-amber-300 mt-0.5">{stats.upcoming}</div>
            </div>
            <div className="bg-red-950/30 border border-red-800/40 rounded-xl px-3.5 py-2">
              <div className="text-[10px] text-red-400/80 uppercase">Past / Unset</div>
              <div className="text-sm font-bold text-red-300 mt-0.5">{stats.overdueOrUnset}</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80"
        >
          <div>
            <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">
              UT Number
            </label>
            <input
              type="text"
              placeholder="Ex. 3857/26"
              value={utFilter}
              onChange={(e) => setUtFilter(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">
              Prisoner Name
            </label>
            <input
              type="text"
              placeholder="Ex. Rahul Kumar"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900 text-white font-bold py-2 px-3 rounded-lg transition shadow-lg shadow-cyan-950/50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="Clear all filters"
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 py-2 px-3 rounded-lg transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {/* Results Table */}
        <div className="max-h-[440px] overflow-y-auto overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40 shadow-inner">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-950 text-slate-400 border-b border-slate-800 shadow-md uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">UT No.</th>
                <th className="p-3.5">Prisoner &amp; Father Name</th>
                <th className="p-3.5">FIR / Crime No.</th>
                <th className="p-3.5">Pending Court</th>
                <th className="p-3.5">Next Hearing Date</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <div className="inline-flex items-center gap-2.5">
                      <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
                      <span>Fetching court hearing schedule...</span>
                    </div>
                  </td>
                </tr>
              ) : hearingList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-lg">📂</span>
                      <span className="text-slate-300 font-semibold">No Hearing Records Found</span>
                      <span className="text-[11px] text-slate-500">
                        Try adjusting your date range or search parameters.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                hearingList.map((item) => {
                  const badge = getDateBadge(item.nextHearingDate);
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-900/80 transition group"
                    >
                      <td className="p-3.5">
                        <span className="font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded">
                          {item.utNumber}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-sans font-semibold text-white text-xs">
                          {item.prisonerName}
                        </div>
                        {item.fatherName && (
                          <div className="text-[11px] text-slate-400">
                            S/o {item.fatherName}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        <div>{item.firNumber}</div>
                        {item.actSection && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                            u/s {item.actSection}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-300 font-sans">
                        {item.courtName || 'N/A'}
                      </td>
                      <td className="p-3.5 font-bold text-amber-300">
                        {item.nextHearingDate
                          ? new Date(item.nextHearingDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleOpenReschedule(item)}
                          className="bg-slate-800/90 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500 px-3 py-1.5 rounded-lg transition cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span>Reschedule</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Classy Reschedule Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveNewDate}
            className="bg-slate-900 border border-slate-700/90 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-sans font-bold text-white">
                  Schedule Next Court Hearing
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  <span className="text-cyan-400 font-bold">{selectedRecord.prisonerName}</span> • UT:{' '}
                  <span className="text-white">{selectedRecord.utNumber}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] space-y-1 text-slate-400">
              <div>
                FIR No: <span className="text-slate-200 font-semibold">{selectedRecord.firNumber}</span>
              </div>
              <div>
                Court: <span className="text-slate-200 font-semibold">{selectedRecord.courtName}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">
                Next Hearing Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={newDateVal}
                onChange={(e) => setNewDateVal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">
                Judicial / Peshi Remarks
              </label>
              <input
                type="text"
                placeholder="Ex. Remand extended / Chargesheet awaited"
                value={remarksVal}
                onChange={(e) => setRemarksVal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900 text-white font-bold px-4 py-2 rounded-lg transition shadow-lg shadow-cyan-950/50 cursor-pointer"
              >
                {isUpdating ? 'Saving...' : 'Confirm Hearing Date'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NextHearingDate;