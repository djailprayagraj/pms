import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAdalatByDate, deleteAdalatEntry } from '.././api/adalatService';

export const useHistoryRecords = (isOpen) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dbRecords, setDbRecords] = useState([]);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'session', 'vc'
  const [genderFilter, setGenderFilter] = useState('all'); // 'all', 'male', 'female'
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [feedMessage, setFeedMessage] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, record: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDbRecords = useCallback(async () => {
    try {
      setIsLoadingDb(true);
      const response = await fetchAdalatByDate(selectedDate);
      
      const rawData = Array.isArray(response) 
        ? response 
        : (response?.data && Array.isArray(response.data) ? response.data : response?.entries || []);

      const formattedRecords = rawData.map((item) => ({
        id: item._id || item.id,
        ut_code: item.utNumber || item.ut_code || 'N/A',
        full_name: item.prisonerName || item.full_name || 'N/A',
        father_name: item.fatherName || item.father_name || 'N/A',
        barrack: item.barrack || '6-B',
        fir_number: item.firNumber || item.fir_number || 'N/A',
        legal_provision: item.warrantType || item.actSection || 'N/A',
        action_category: item.actionCategory || 'N/A',
        sub_option: item.appearanceMode === 'VC' ? 'vc' : 'adalat',
        gender: item.gender ? item.gender.trim().toUpperCase() : 'M', 
        hearing_date: item.hearingDate ? item.hearingDate.split('T')[0] : selectedDate,
        court_name: item.courtName || 'N/A',
        district: item.district || 'Prayagraj',
        is_riha: item.custodyStatus === 'RIHA',
        created_at: item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
      }));

      setDbRecords(formattedRecords);
    } catch (error) {
      console.error('Failed to fetch entries directly from database:', error);
      setFeedMessage({ type: 'error', text: '❌ Failed to load records from database.' });
    } finally {
      setIsLoadingDb(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (isOpen) {
      fetchDbRecords();
    }
  }, [isOpen, selectedDate, fetchDbRecords]);

  const filteredRecords = useMemo(() => {
    return dbRecords.filter((r) => {
      const matchesCategory = 
        filterMode === 'all' ? true :
        filterMode === 'vc' ? r.sub_option === 'vc' :
        filterMode === 'session' ? r.sub_option !== 'vc' : true;

      let matchesGender = true;
      if (genderFilter === 'male') {
        matchesGender = r.gender === 'M' || r.gender === 'MALE';
      } else if (genderFilter === 'female') {
        matchesGender = r.gender === 'F' || r.gender === 'FEMALE';
      }

      return matchesCategory && matchesGender;
    });
  }, [dbRecords, filterMode, genderFilter]);

  const groupedPrisonerRecords = useMemo(() => {
    const map = new Map();

    filteredRecords.forEach((record) => {
      const key = record.ut_code && record.ut_code !== 'N/A' ? record.ut_code : record.full_name;

      if (!map.has(key)) {
        map.set(key, {
          ...record,
          cases: [{
            id: record.id,
            fir_number: record.fir_number,
            legal_provision: record.legal_provision,
            court_name: record.court_name,
            sub_option: record.sub_option,
            created_at: record.created_at,
          }],
        });
      } else {
        const existing = map.get(key);
        existing.cases.push({
          id: record.id,
          fir_number: record.fir_number,
          legal_provision: record.legal_provision,
          court_name: record.court_name,
          sub_option: record.sub_option,
          created_at: record.created_at,
        });
      }
    });

    return Array.from(map.values());
  }, [filteredRecords]);

  const handleConfirmDelete = async () => {
    const record = deleteModal.record;
    if (!record || !record.id) return;

    try {
      setIsDeleting(true);
      await deleteAdalatEntry(record.id);
      setDbRecords((prev) => prev.filter((item) => item.id !== record.id));
      setFeedMessage({ type: 'success', text: '🗑️ Entry successfully deleted from database.' });
    } catch (error) {
      console.error('Failed to delete entry from database:', error);
      setFeedMessage({ type: 'error', text: '❌ Failed to delete entry from database.' });
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, record: null });
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    dbRecords,
    filterMode,
    setFilterMode,
    genderFilter,
    setGenderFilter,
    isLoadingDb,
    feedMessage,
    setFeedMessage,
    deleteModal,
    setDeleteModal,
    isDeleting,
    fetchDbRecords,
    groupedPrisonerRecords,
    handleConfirmDelete,
  };
};