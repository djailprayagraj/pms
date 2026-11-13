import API from './axios';
import { BaseURL } from '../BaseURL/Baseurl';

// 1. Feed / Post all selected Adalat entries
export const postAdalatEntries = async (entries) => {
  const response = await API.post(`${BaseURL}/api/adalat/feed`, { entries });  // this is the api responsible for feeding adalat/vc/session
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

//5. get the list of all the courts from db
export const allCourtsList = async () => {
  const response = await API.get(`${BaseURL}/api/adalat/getAllCourts`);
  return response.data;
}

//6. feed new court to the list of courts 
export const feedNewCourt = async () => {
  const response = await API.post(`${BaseURL}/api/adalat/feedNewCourt`);
  return response.data;
}


// 7. Get next hearing records with optional date range, utNumber, and prisonerName filters
export const getNextHearingRecords = async (params) => {
  const response = await API.get(`${BaseURL}/api/adalat/next-hearings`, { params });
  return response.data;
};

// 8. Update next hearing date for a record
export const updateNextHearingDate = async (payload) => {
  const response = await API.put(`${BaseURL}/api/adalat/update-next-hearing`, payload);
  return response.data;
};