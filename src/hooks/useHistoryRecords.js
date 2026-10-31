import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedDate } from '../redux/slices/adalatSlice'; // Adjust import path to your slice
import { fetchAdalatByDate, deleteAdalatEntry } from '../api/adalatService';

export const useHistoryRecords = () => {
  const dispatch = useDispatch();
  const selectedDate = useSelector((state) => state.adalat?.selectedDate || new Date().toISOString().split('T')[0]);

  const [dbRecords, setDbRecords] = useState([]);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'session', 'vc'
  const [genderFilter, setGenderFilter] = useState('all'); // 'all', 'male', 'female'
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [feedMessage, setFeedMessage] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, record: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSetSelectedDate = (date) => {
    dispatch(setSelectedDate(date));
  };

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
    fetchDbRecords();
  }, [selectedDate, fetchDbRecords]);

  // --- Dynamic Badge Counts Calculation ---
  const counts = useMemo(() => {
    const isMale = (g) => g === 'M' || g === 'MALE';
    const isFemale = (g) => g === 'F' || g === 'FEMALE';
    const isSession = (s) => s !== 'vc';
    const isVc = (s) => s === 'vc';

    // Type counts (Total Unique Inmates per mode)
    const getUniqueCount = (records) => {
      const map = new Map();
      records.forEach(r => {
        const key = r.ut_code && r.ut_code !== 'N/A' ? r.ut_code : r.full_name;
        map.set(key, true);
      });
      return map.size;
    };

    const sessionRecords = dbRecords.filter(r => isSession(r.sub_option));
    const vcRecords = dbRecords.filter(r => isVc(r.sub_option));

    // Base records for gender filtering based on currently selected Type filterMode
    const activeTypeRecords = 
      filterMode === 'session' ? sessionRecords :
      filterMode === 'vc' ? vcRecords : dbRecords;

    const maleRecords = activeTypeRecords.filter(r => isMale(r.gender));
    const femaleRecords = activeTypeRecords.filter(r => isFemale(r.gender));

    return {
      all: getUniqueCount(dbRecords),
      session: getUniqueCount(sessionRecords),
      vc: getUniqueCount(vcRecords),
      genderAll: getUniqueCount(activeTypeRecords),
      genderMale: getUniqueCount(maleRecords),
      genderFemale: getUniqueCount(femaleRecords),
    };
  }, [dbRecords, filterMode]);

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
    setSelectedDate: handleSetSelectedDate,
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
    counts, 
  };
};