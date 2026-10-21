import axios from 'axios';
import { BaseURL } from '../BaseURL/Baseurl';

// Create an Axios instance with the base URL
const API = axios.create({
  baseURL:BaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach the JWT token to requests if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;