import API from './axios';
import { BaseURL } from '../BaseURL/Baseurl';

// -------------------------------------------------------------
// UNIVERSAL ADALAT APPEARANCE LOGS & MASTER API
// -------------------------------------------------------------

// 1. Fetch Adalat logs with flexible query filters (UT No, FIR No, Hearing Date)
export const fetchUniversalAdalatLogs = async (params = {}) => {
  const response = await API.get(`${BaseURL}/api/adalat/logs`, { params });
  return response.data;
};

// 2. Create a single Adalat Log entry
export const createUniversalAdalatEntry = async (entryData) => {
  const response = await API.post(`${BaseURL}/api/adalat/log`, entryData);
  return response.data;
};

// 3. Update an existing Adalat entry by MongoDB _id
export const updateUniversalAdalatEntryById = async (id, updateData) => {
  const response = await API.put(`${BaseURL}/api/adalat/${id}`, updateData);
  return response.data;
};

// 4. Update an Adalat entry by UT Number
export const updateUniversalAdalatEntryByUt = async (utNumber, updateData) => {
  const encodedUt = encodeURIComponent(utNumber);
  const response = await API.put(`${BaseURL}/api/adalat/ut/${encodedUt}`, updateData);
  return response.data;
};

// 5. Delete an Adalat entry by ID
export const deleteUniversalAdalatEntry = async (id) => {
  const response = await API.delete(`${BaseURL}/api/adalat/${id}`);
  return response.data;
};

// 6. Bulk update / replace court names across master prisoner records (e.g., Allahabad District Court -> N/A)
export const bulkReplaceMasterCourtName = async (targetCourt, newCourt) => {
  const response = await API.put(`${BaseURL}/api/prisoner/bulk-update-court`, {
    targetCourt,
    newCourt,
  });
  return response.data;
};