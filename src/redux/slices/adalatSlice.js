import { createSlice } from '@reduxjs/toolkit';

const getTomorrowFormatted = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const initialState = {
  mainAction: 'adalat',
  subOption: 'session',
  selectedDate: getTomorrowFormatted(),
  searchTab: 'ut',
  part1: '',
  part2: '',
  searchName: '',
  searchCrime: '',
  loading: false,
  errorMsg: '',
  submitSuccess: '',
  prisonerResult: null,
  selectedCaseIds: [],
  peshiDate: '',
  courtName: '',
  adalatType: 'Lok Adalat',
  peshiRemarks: '',
  isSubmitting: false,
  historyRecords: [],
};

export const adalatSlice = createSlice({
  name: 'adalat',
  initialState,
  reducers: {
    setMainAction: (state, action) => {
      const newAction = action.payload;
      state.mainAction = newAction;
      if (newAction === 'adalat') {
        state.subOption = 'session';
      } else if (newAction === 'rihaai') {
        state.subOption = 'bail';
      } else if (newAction === 'sansodhan') {
        state.subOption = 'personal';
      }
    },
    setSubOption: (state, action) => {
      state.subOption = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSearchTab: (state, action) => {
      state.searchTab = action.payload;
    },
    setPart1: (state, action) => {
      state.part1 = action.payload;
    },
    setPart2: (state, action) => {
      state.part2 = action.payload;
    },
    setSearchName: (state, action) => {
      state.searchName = action.payload;
    },
    setSearchCrime: (state, action) => {
      state.searchCrime = action.payload;
    },
    setPeshiDate: (state, action) => {
      state.peshiDate = action.payload;
    },
    setCourtName: (state, action) => {
      state.courtName = action.payload;
    },
    setAdalatType: (state, action) => {
      state.adalatType = action.payload;
    },
    setPeshiRemarks: (state, action) => {
      state.peshiRemarks = action.payload;
    },
    toggleSelectCase: (state, action) => {
      const caseId = action.payload;
      if (state.selectedCaseIds.includes(caseId)) {
        state.selectedCaseIds = state.selectedCaseIds.filter((id) => id !== caseId);
      } else {
        state.selectedCaseIds.push(caseId);
      }
    },
    selectAllCases: (state, action) => {
      state.selectedCaseIds = action.payload;
    },
    clearSelectedCases: (state) => {
      state.selectedCaseIds = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setErrorMsg: (state, action) => {
      state.errorMsg = action.payload;
    },
    setSubmitSuccess: (state, action) => {
      state.submitSuccess = action.payload;
    },
    setPrisonerResult: (state, action) => {
      state.prisonerResult = action.payload;
      state.selectedCaseIds = [];
    },
    setIsSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    addHistoryRecord: (state, action) => {
      state.historyRecords.unshift(action.payload);
    },
    addHistoryEntries: (state, action) => {
      const newEntries = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.historyRecords = [...newEntries, ...state.historyRecords];
    },
    // --- Added removeHistoryEntry reducer ---
    removeHistoryEntry: (state, action) => {
      const targetId = action.payload;
      state.historyRecords = state.historyRecords.filter(
        (record, index) => (record.id || index) !== targetId
      );
    },
    clearSearchAlerts: (state) => {
      state.errorMsg = '';
      state.submitSuccess = '';
    },
    resetAdalatForm: (state) => {
      state.peshiDate = '';
      state.peshiRemarks = '';
      state.courtName = '';
      state.errorMsg = '';
      state.submitSuccess = '';
    },
    resetSearchForm: (state) => {
      state.part1 = '';
      state.part2 = '';
      state.searchName = '';
      state.searchCrime = '';
      state.prisonerResult = null;
      state.selectedCaseIds = [];
      state.errorMsg = '';
      state.submitSuccess = '';
    },
  },
});

export const {
  setMainAction,
  setSubOption,
  setSelectedDate,
  setSearchTab,
  setPart1,
  setPart2,
  setSearchName,
  setSearchCrime,
  setPeshiDate,
  setCourtName,
  setAdalatType,
  setPeshiRemarks,
  toggleSelectCase,
  selectAllCases,
  clearSelectedCases,
  setLoading,
  setErrorMsg,
  setSubmitSuccess,
  setPrisonerResult,
  setIsSubmitting,
  addHistoryRecord,
  addHistoryEntries,
  removeHistoryEntry, // Exported properly here
  clearSearchAlerts,
  resetAdalatForm,
  resetSearchForm,
} = adalatSlice.actions;

export default adalatSlice.reducer;