import API from './axios';
import { BaseURL } from '../BaseURL/Baseurl';

// 1. Feed / Post all selected Adalat entries
export const postAdalatEntries = async (entries) => {
  const response = await API.post(`${BaseURL}/api/adalat/feed`, { entries });
  return response.data;
};


// 2. Update a single Adalat entry by UT Number (Warrant, Court, Status, etc.)
export const updateAdalatEntryByUt = async (utNumber, updateData) => {
  const encodedUt = encodeURIComponent(utNumber);
  const response = await API.put(`${BaseURL}/api/adalat/ut/${encodedUt}`, updateData);
  return response.data;
};

// 3. Fetch all Adalat records for a specific date (Format: YYYY-MM-DD)
export const fetchAdalatByDate = async (date) => {
  const response = await API.get(`${BaseURL}/api/adalat/date/${date}`);
  return response.data;
};

// 4. Delete a single Adalat entry by ID (DELETE /api/adalat/:id)
export const deleteAdalatEntry = async (id) => {
  const response = await API.delete(`${BaseURL}/api/adalat/${id}`);
  return response.data;
};