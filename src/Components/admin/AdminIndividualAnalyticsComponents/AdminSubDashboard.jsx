import React, { useState, useEffect, useMemo } from 'react';
import CasesPeshiDetails from '../CasesPeshiDetails';
import { getUsers } from '../../../api/authService';
import { fetchIndividualPrisonerStats } from '../../../api/statsApi';

import SearchToolbar from './SearchToolbar';
import PrisonerHeader from './PrisonerHeader';
import StatsOverview from './StatsOverview';
import AppearanceTable from './AppearanceTable';

export default function AdminSubDashboard() {
  const [prisonersList, setPrisonersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  
  // Date Range Filter States
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  // Real individual prisoner backend data states
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [prisonerStats, setPrisonerStats] = useState(null);
  const [prisonerBreakdowns, setPrisonerBreakdowns] = useState({ byCourt: [], byFIR: [] });
  const [prisonerHistory, setPrisonerHistory] = useState([]);
  
  // Frontend Table Filter & Search States
  const [tableSearchText, setTableSearchText] = useState('');
  const [filterMode, setFilterMode] = useState('ALL');
  const [filterWarrant, setFilterWarrant] = useState('ALL');
  const [filterCourt, setFilterCourt] = useState('ALL');

  const [errorMessage, setErrorMessage] = useState('');
  const [showCasesModal, setShowCasesModal] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const response = await getUsers({ limit: 50 });
        const records = Array.isArray(response) ? response : response?.prisoners || response?.data || [];

        if (records.length > 0) {
          setPrisonersList(records);
          const firstIdentifier = records[0].RegisterNo || records[0].utNumber || '';
          if (firstIdentifier) {
            setSearchInput(firstIdentifier);
            await loadIndividualStats(firstIdentifier, startDate, endDate);
          }
        }
      } catch (error) {
        console.error('Failed to fetch initial prisoners:', error);
        setErrorMessage('Failed to connect to server and fetch prisoner records.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const loadIndividualStats = async (identifier, start = startDate, end = endDate) => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSelectedProfile(null);

      const data = await fetchIndividualPrisonerStats({
        utNumber: identifier,
        startDate: start,
        endDate: end,
      });

      if (data && data.success) {
        setSelectedProfile(data.profile);
        setPrisonerStats(data.stats);
        setPrisonerBreakdowns(data.breakdowns || { byCourt: [], byFIR: [] });
        setPrisonerHistory(data.history || []);
        setTableSearchText('');
        setFilterMode('ALL');
        setFilterWarrant('ALL');
        setFilterCourt('ALL');
      }
    } catch (err) {
      console.error('Error fetching individual prisoner stats:', err);
      setErrorMessage(`No prisoner found with exact UT Number "${identifier}". Please verify and try again.`);
      setSelectedProfile(null);
      setPrisonerStats(null);
      setPrisonerHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      setErrorMessage('Please enter an exact UT Number.');
      return;
    }
    await loadIndividualStats(query, startDate, endDate);
  };

  const handleQuickSelect = async (prisoner) => {
    const identifier = prisoner.RegisterNo || prisoner.utNumber || '';
    if (identifier) {
      setSearchInput(identifier);
      await loadIndividualStats(identifier, startDate, endDate);
    }
  };

  const handleDateFilterChange = async (newStart, newEnd) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    if (searchInput.trim() && selectedProfile) {
      await loadIndividualStats(searchInput.trim(), newStart, newEnd);
    }
  };

  const uniqueCourts = useMemo(() => {
    const courts = new Set();
    prisonerHistory.forEach(item => {
      if (item.courtName) courts.add(item.courtName);
    });
    return Array.from(courts);
  }, [prisonerHistory]);

  const filteredHistory = useMemo(() => {
    return prisonerHistory.filter(item => {
      const matchesSearch = 
        !tableSearchText || 
        (item.firNumber && item.firNumber.toLowerCase().includes(tableSearchText.toLowerCase())) ||
        (item.courtName && item.courtName.toLowerCase().includes(tableSearchText.toLowerCase())) ||
        (item.warrantType && item.warrantType.toLowerCase().includes(tableSearchText.toLowerCase())) ||
        (item.hearingDate && new Date(item.hearingDate).toLocaleDateString().includes(tableSearchText));

      const matchesMode = 
        filterMode === 'ALL' || 
        (filterMode === 'VC' && item.appearanceMode === 'VC') ||
        (filterMode === 'PHYSICAL' && item.appearanceMode !== 'VC');

      const matchesWarrant = 
        filterWarrant === 'ALL' || 
        (item.warrantType && item.warrantType.includes(filterWarrant));

      const matchesCourt = 
        filterCourt === 'ALL' || 
        item.courtName === filterCourt;

      return matchesSearch && matchesMode && matchesWarrant && matchesCourt;
    });
  }, [prisonerHistory, tableSearchText, filterMode, filterWarrant, filterCourt]);

  if (loading && !selectedProfile && prisonersList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-mono text-xs">
        Loading prisoner intelligence & analytics...
      </div>
    );
  }

  const casesData = prisonerBreakdowns.byFIR.map((fir) => ({
    caseNo: fir.courtName || 'District Court',
    firNo: fir._id || 'N/A',
    courtName: fir.courtName || 'N/A',
    sections: fir.actSection || 'N/A',
    warrantType: fir.currentWarrant || 'Standard Warrant',
    status: fir.custodyStatus || 'ACTIVE_CUSTODY',
    totalHearings: fir.totalHearings || 0,
  }));

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      <SearchToolbar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateFilterChange}
        onSearch={handleSearch}
        loading={loading}
        prisonersList={prisonersList}
        onQuickSelect={handleQuickSelect}
        errorMessage={errorMessage}
      />

      {selectedProfile ? (
        <>
          <PrisonerHeader
            selectedProfile={selectedProfile}
            onOpenCasesModal={() => setShowCasesModal(true)}
            casesCount={casesData.length}
          />

          <StatsOverview prisonerStats={prisonerStats} />

          <AppearanceTable
            filteredHistory={filteredHistory}
            totalHistoryCount={prisonerHistory.length}
            tableSearchText={tableSearchText}
            setTableSearchText={setTableSearchText}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            filterWarrant={filterWarrant}
            setFilterWarrant={setFilterWarrant}
            filterCourt={filterCourt}
            setFilterCourt={setFilterCourt}
            uniqueCourts={uniqueCourts}
          />
        </>
      ) : (
        <div className="text-center py-20 bg-slate-900/30 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-sm font-mono">Please enter an exact UT Number and click Search to view prisoner intelligence.</p>
        </div>
      )}

      {showCasesModal && selectedProfile && (
        <CasesPeshiDetails
          prisoner={{
            name: selectedProfile?.prisonerName || 'Unknown',
            utNumber: selectedProfile?.utNumbers?.[0] || 'N/A',
            wardNo: selectedProfile?.barrack || 'Unassigned',
            policeStation: selectedProfile?.district || 'N/A',
            custodyStatus: selectedProfile?.custodyStatus || 'ACTIVE_CUSTODY',
            cases: casesData
          }}
          onClose={() => setShowCasesModal(false)}
        />
      )}
    </div>
  );
}