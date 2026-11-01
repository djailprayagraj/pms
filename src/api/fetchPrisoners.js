import API from './axios';
import { BaseURL } from '../BaseURL/Baseurl';

// Fetch all general prisoners with pagination and search
export const fetchAllPrisoners = async (page = 1, limit = 50, search = '') => {
  const response = await API.get(
    `${BaseURL}/api/prisoners/all?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
  );
  return response.data;
};

// Fetch all convicted prisoners (Prisoner Type: "CT") with pagination and search
export const fetchAllConvictedPrisoners = async (page = 1, limit = 50, search = '') => {
  const response = await API.get(
    `${BaseURL}/api/prisoners/convicted?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
  );
  return response.data;
};

// Update prisoner record by ID
export const updatePrisonerRecord = async (id, updateData) => {
  const response = await API.put(
    `${BaseURL}/api/prisoners/${id}`,
    updateData
  );
  return response.data;
};