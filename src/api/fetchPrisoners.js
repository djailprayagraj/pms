import API from './axios';
import { BaseURL } from '../BaseURL/Baseurl';

// 1. Login funtion 
export const fetchAllPrisoners = async (credentials) => {
 console.log(credentials)
  const response = await API.post(`${BaseURL}/api/prisoners/all`);
  
  return response.data;
};