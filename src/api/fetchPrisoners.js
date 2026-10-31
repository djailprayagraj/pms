import API from './axios';
import { BaseURL } from '../BaseURL/Baseurl';

// 1. Login funtion 
export const fetchAllPrisoners = async (page = 1, limit = 50, search = '') => {
  const response = await API.get(
    `${BaseURL}/api/prisoners/all?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
  );
  return response.data;
};

// Ensure this export exists!
export const updatePrisonerRecord = async (id, updateData) => {
  const response = await API.put(
    `${BaseURL}/api/prisoners/${id}`,
    updateData
  );
  return response.data;
};