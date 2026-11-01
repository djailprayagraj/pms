import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'dashboard',
  dashboardViewMode: 'group', // 'group' | 'individual'
};

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setDashboardViewMode: (state, action) => {
      state.dashboardViewMode = action.payload;
    },
  },
});

export const { setActiveTab, setDashboardViewMode } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;