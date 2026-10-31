import API from './axios';
import { BaseURL } from '../BaseURL/Baseurl';

// 1. Login function 
export const loginUser = async (credentials) => {
  console.log(credentials);
  const response = await API.post(`${BaseURL}/api/auth/login`, credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// 2. Admin: Add User API
export const addUser = async (userData) => {
  const response = await API.post(`${BaseURL}/api/users/addUser`, userData);
  return response.data;
};

// Logout helper
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// 3. Adalat Feeding: Search prisoner records by parameters
export const getUsers = async (searchParams) => {
  const queryParams = new URLSearchParams(searchParams).toString();
  const response = await API.get(`${BaseURL}/api/prisoners/users?${queryParams}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await API.put(`${BaseURL}/users/${id}`, userData);
  return response.data;
};

// Access - admin 
// Method - get
// URL - api/users/getAllUsers
export const getAllUsersForAdmin = async () => {
  const response = await API.get('api/users/getAllUsers');
  return response.data;
}

export const updateUserAdminApi = async (updateData) => {
  const response = await API.put('api/users/updateUserAdmin', updateData);
  return response.data;
};