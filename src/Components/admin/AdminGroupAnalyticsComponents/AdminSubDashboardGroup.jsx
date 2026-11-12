import React, { useState, useEffect } from 'react';
import { fetchAdalatLogs } from '../../../api/statsApi';
import DashboardHeader from './DashboardHeader';
import FilterToolbar from './FilterToolbar';
import StatisticsGrid from './StatisticsGrid';
import ProductionLogTable from './ProductionLogTable';
import WarrantAnalyticsTab from './WarrantAnalyticsTab';

export default function AdminSubDashboardGroup() {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [selectedWarrantType, setSelectedWarrantType] = useState('ALL');
  const [selectedModeFilter, setSelectedModeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('productions');

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredTotalCount, setFilteredTotalCount] = useState(0);

  const [serverStats, setServerStats] = useState({
    totalInRange: 0,
    count167: 0,
    count209: 0,
    count309: 0,
    vcCount: 0,
    sessionCount: 0,
    vc167: 0,
    vc209: 0,
    vc309: 0,
    session167: 0,
    session209: 0,
    session309: 0,
  });

  const loadAdalatLogs = async (pageNum = 1, isReset = false) => {
    if (loading && !isReset) return;
    try {
      setLoading(true);
      setError(null);

      const response = await fetchAdalatLogs({
        startDate,
        endDate,
        warrantType: selectedWarrantType === 'ALL' ? '' : selectedWarrantType,
        appearanceMode: selectedModeFilter === 'ALL' ? '' : selectedModeFilter,
        search: searchQuery,
        page: pageNum,
        limit: 50,
      });

      const incomingLogs = response.data || [];

      if (isReset) {
        setLogs(incomingLogs);
      } else {
        setLogs((prev) => [...prev, ...incomingLogs]);
      }

      if (response.stats) setServerStats(response.stats);

      setFilteredTotalCount(response.filteredTotalCount || 0);
      setHasMore(pageNum < (response.totalPages || 1) && incomingLogs.length > 0);
    } catch (err) {
      console.error('Failed to load Adalat logs:', err);
      setError('Failed to fetch collective appearance logs from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadAdalatLogs(1, true);
  }, [startDate, endDate, selectedWarrantType, selectedModeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadAdalatLogs(1, true);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadAdalatLogs(nextPage, false);
    }
  };

  const exportGroupCSV = () => {
    if (!logs.length) {
      alert('No production records available to export.');
      return;
    }

    const headers = ['UT Number,Prisoner Name,Father Name,FIR Number,Hearing Date,Appearance Mode,Court Name,Warrant Type,Custody Status'];
    const rows = logs.map(
      (p) =>
        `"${p.utNumber}","${p.prisonerName}","${p.fatherName}","${p.firNumber || ''}","${new Date(p.hearingDate).toLocaleDateString()}","${p.appearanceMode}","${p.courtName}","${p.warrantType}","${p.custodyStatus}"`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Group_Prisoner_Production_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      <DashboardHeader onExport={exportGroupCSV} />

      <FilterToolbar
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedWarrantType={selectedWarrantType}
        setSelectedWarrantType={setSelectedWarrantType}
        selectedModeFilter={selectedModeFilter}
        setSelectedModeFilter={setSelectedModeFilter}
        loadedCount={logs.length}
        totalCount={filteredTotalCount}
      />

      <StatisticsGrid
        serverStats={serverStats}
        selectedWarrantType={selectedWarrantType}
        setSelectedWarrantType={setSelectedWarrantType}
        selectedModeFilter={selectedModeFilter}
        setSelectedModeFilter={setSelectedModeFilter}
      />

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex space-x-8 text-sm font-bold pt-2">
        <button
          onClick={() => setActiveTab('productions')}
          className={`pb-3 transition relative cursor-pointer ${activeTab === 'productions' ? 'text-red-400 border-b-2 border-red-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Group Production Log ({filteredTotalCount})
        </button>
        <button
          onClick={() => setActiveTab('conversions')}
          className={`pb-3 transition relative cursor-pointer ${activeTab === 'conversions' ? 'text-red-400 border-b-2 border-red-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Warrant & Mode Cross-Tab Analytics
        </button>
      </div>

      {activeTab === 'productions' && (
        <ProductionLogTable
          logs={logs}
          loading={loading}
          error={error}
          serverStats={serverStats}
          onLoadMore={handleLoadMore}
        />
      )}

      {activeTab === 'conversions' && (
        <WarrantAnalyticsTab
          serverStats={serverStats}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
}