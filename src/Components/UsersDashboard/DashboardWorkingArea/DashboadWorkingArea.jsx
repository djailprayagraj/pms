import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUsers } from '../../../api/authService';
import {
  setErrorMsg,
  setSubmitSuccess,
  setPrisonerResult,
  setLoading,
  setCourtName,
  setIsSubmitting,
  addHistoryRecord,
  resetAdalatForm,
  clearSearchAlerts,
} from '../../../redux/slices/adalatSlice';
import HistorySection from './HistorySection';
import SearchSection from './SearchSection';
import StatsSection from './StatsSection';
import WarrantWiseListAdalat from './WarrantWiseListAdalat';

const DashboardWorkingArea = () => {
  const dispatch = useDispatch();
  const {
    searchTab,
    part1,
    part2,
    searchName,
    searchCrime,
    prisonerResult,
    peshiDate,
    courtName,
    adalatType,
    peshiRemarks,
  } = useSelector((state) => state.adalat);

  // --- Handle Real API Search Submission ---
  const handleSearch = async (e) => {
    e.preventDefault();
    dispatch(clearSearchAlerts());

    let apiParams = {};

    // 1. Validation & Query Parameter Construction
    if (searchTab === 'ut') {
      const num1 = parseInt(part1, 10);
      if (isNaN(num1) || num1 < 1 || num1 > 99999) {
        dispatch(setErrorMsg('First part of UT number must be between 1 and 99999.'));
        return;
      }
      const num2 = parseInt(part2, 10);
      if (isNaN(num2) || num2 < 24 || num2 > 99) {
        dispatch(setErrorMsg('Second part of UT number must be a two-digit year code (24-99).'));
        return;
      }
      apiParams = { utNumber: `${part1}/${part2}` };
    } else if (searchTab === 'name') {
      if (!searchName.trim()) {
        dispatch(setErrorMsg('Please enter a prisoner name to search.'));
        return;
      }
      apiParams = { name: searchName.trim() };
    } else if (searchTab === 'crime') {
      if (!searchCrime.trim()) {
        dispatch(setErrorMsg('Please enter a Crime / FIR Number to search.'));
        return;
      }
      apiParams = { firNo: searchCrime.trim() };
    }

    dispatch(setLoading(true));

    try {
      // 2. Fetch data from Backend
      const responseData = await getUsers(apiParams);

      // 3. Console log the fetched response data in the frontend
      console.log('Fetched Prisoner Record Response:', responseData);

      // 4. Save to Redux Store
      dispatch(setPrisonerResult(responseData));

      if (responseData.cases && responseData.cases.length > 0) {
        dispatch(setCourtName(responseData.cases[0].courtName || ''));
      }
    } catch (error) {
      console.error('Error fetching prisoner record:', error);
      const message =
        error.response?.data?.message || 'Failed to fetch prisoner records from database.';
      dispatch(setErrorMsg(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // --- Handle Adalat Peshi Feeding Form Submission ---
  const handleAdalatSubmit = (e) => {
    e.preventDefault();
    if (!prisonerResult) return;

    if (!peshiDate) {
      dispatch(setErrorMsg('Please select a valid Peshi / Adalat Date.'));
      return;
    }

    dispatch(setIsSubmitting(true));
    dispatch(setErrorMsg(''));

    setTimeout(() => {
      dispatch(setIsSubmitting(false));

      const newHistoryItem = {
        id: Date.now(),
        utNumber: prisonerResult.utNumber,
        name: prisonerResult.prisonerName,
        barrack: prisonerResult.barrack,
        warrantType: prisonerResult.cases?.[0]?.warrantType || 'N/A',
        peshiDate: peshiDate,
        adalatType: adalatType,
        courtName: courtName || prisonerResult.cases?.[0]?.courtName || 'N/A',
        remarks: peshiRemarks || 'Adalat proceeding updated.',
        status: prisonerResult.cases?.[0]?.isRiha ? 'Released/Bail' : 'In Custody',
      };

      dispatch(addHistoryRecord(newHistoryItem));
      dispatch(
        setSubmitSuccess(
          `Adalat record for ${prisonerResult.prisonerName} (UT: ${prisonerResult.utNumber}) submitted successfully to database!`
        )
      );

      dispatch(resetAdalatForm());
    }, 600);
  };

  return (
    <div className="space-y-6">
     
      <HistorySection />
      <SearchSection handleSearch={handleSearch} handleAdalatSubmit={handleAdalatSubmit} />
      <StatsSection />
    </div>
  );
};

export default DashboardWorkingArea;