import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adalatReducer from './slices/adalatSlice'; // 1. Import default export (the reducer)
import adminDashboardReducer from '../redux/slices/adminDashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adalat: adalatReducer, // 2. Rename key to 'adalat' to match state.adalat in useSelector
    adminDashboard: adminDashboardReducer,
  },
});