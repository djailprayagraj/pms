import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
// import prisonerReducer from './slices/prisonerReducer'; // Future slice example

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // prisoners: prisonerReducer, // Future mapping
  },
});