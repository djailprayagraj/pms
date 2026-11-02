import React, { useState, useEffect } from 'react';
import { fetchAdalatByDate } from '../../api/adalatService';
import {
  filterRecordsByMode,
  deduplicateRecordsByUT,
  sortRecordsWithFemalesLast,
  calculateTotalWarrants
} from './helpers';
import { generateAndOpenPrintPreview } from './printUtils';
import TopFilterHeader from './TopFilterHeader';
import SummaryBanner from './SummaryBanner';
import WarrantTable from './WarrantTable';

const WarrantWiseListAdalat = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [appearanceFilter, setAppearanceFilter] = useState('SESSION');

  const [loading, setLoading] = useState(false);
  const [rawRecords, setRawRecords] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchWarrantLogsRange = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const start = new Date(fromDate);
      const end = new Date(toDate);

      if (start > end) {
        setErrorMessage('From Date cannot be later than To Date.');
        setLoading(false);
        return;
      }

      let aggregatedRecords = [];
      let currentDate = new Date(start);

      while (currentDate <= end) {
        const dateString = currentDate.toISOString().split('T')[0];
        try {
          const response = await fetchAdalatByDate(dateString);
          const data = response.data || response;
          if (Array.isArray(data)) {
            const stampedData = data.map((item) => ({
              ...item,
              hearingDate: item.hearingDate ? item.hearingDate.split('T')[0] : dateString,
            }));
            aggregatedRecords = [...aggregatedRecords, ...stampedData];
          }
        } catch (dayErr) {
          console.warn(`Failed to fetch records for ${dateString}`, dayErr);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const uniqueRecords = deduplicateRecordsByUT(aggregatedRecords);
      setRawRecords(uniqueRecords);
    } catch (error) {
      console.error('Error fetching warrant-wise logs by date range:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to fetch logs from server.');
      setRawRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarrantLogsRange();
  }, []);

  const filteredRecords = filterRecordsByMode(rawRecords, appearanceFilter);

  const warrantGroups = {
    '167/187': sortRecordsWithFemalesLast(filteredRecords.filter((item) => (item.warrantType || '167/187') === '167/187')),
    '209/232': sortRecordsWithFemalesLast(filteredRecords.filter((item) => item.warrantType === '209/232')),
    '309/346': sortRecordsWithFemalesLast(filteredRecords.filter((item) => item.warrantType === '309/346')),
  };

  const grandTotalWarrants =
    calculateTotalWarrants(warrantGroups['167/187']) +
    calculateTotalWarrants(warrantGroups['209/232']) +
    calculateTotalWarrants(warrantGroups['309/346']);

  const handlePrint = () => {
    generateAndOpenPrintPreview({
      filteredRecords,
      appearanceFilter,
      fromDate,
      toDate,
      warrantGroups,
      grandTotalWarrants,
      setIsTranslating,
    });
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      <TopFilterHeader
        appearanceFilter={appearanceFilter}
        setAppearanceFilter={setAppearanceFilter}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        fetchWarrantLogsRange={fetchWarrantLogsRange}
        handleOpenPrintPreview={handlePrint}
        loading={loading}
        isTranslating={isTranslating}
        recordsCount={filteredRecords.length}
      />

      {errorMessage && (
        <div className="px-4 py-3 bg-red-950 text-red-300 text-xs font-mono border border-red-800 rounded-xl">
          {errorMessage}
        </div>
      )}

      {!loading && filteredRecords.length > 0 && (
        <SummaryBanner
          fromDate={fromDate}
          toDate={toDate}
          appearanceFilter={appearanceFilter}
          totalInmates={filteredRecords.length}
          grandTotalWarrants={grandTotalWarrants}
        />
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="p-16 text-center text-slate-500 italic font-mono bg-slate-900/40 border border-slate-800 rounded-xl">
            Fetching records from {fromDate} to {toDate}...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-16 text-center text-slate-500 italic font-mono bg-slate-900/40 border border-slate-800 rounded-xl">
            No records found for the range {fromDate} to {toDate} under filter "{appearanceFilter}".
          </div>
        ) : (
          Object.entries(warrantGroups).map(([type, items]) => (
            <WarrantTable
              key={type}
              warrantType={type}
              appearanceFilter={appearanceFilter}
              items={items}
              fromDate={fromDate}
              toDate={toDate}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default WarrantWiseListAdalat;