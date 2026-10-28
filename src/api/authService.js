import API from './axios';
import { BaseURL } from '../BaseURL/Baseurl';

// 1. Login funtion 
export const loginUser = async (credentials) => {
 console.log(credentials)
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

// 3. Admin: Update User API
// export const updateUser = async (userId, updateData) => {
//   const response = await API.put(`${BaseURL}/users/${userId}`, updateData);
//   return response.data;
// };

// Logout helper
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

//this function is for adalat feeding it basically takes a ut number and serches the relevent data agaisnt the preisoner record which we will be using to feed the adalat details
// 3. Adalat Feeding: Search prisoner records by parameters
export const getUsers = async (searchParams) => {
  // ✅ FIX: Compute queryParams inside the function body where searchParams is accessible
  const queryParams = new URLSearchParams(searchParams).toString();
  const response = await API.get(`${BaseURL}/api/prisoners/users?${queryParams}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  return await axios.put(`${BaseURL}/users/${id}`, userData);
};


//access - admin 
//method - get
//url - api/users/getAllUsers
export const getAllUsersForAdmin = async () =>{
  return await API.get('api/users/getAllUsers');
}

export const updateUserAdminApi = async (updateData) => {
  const response = await API.put('api/users/updateUserAdmin', updateData);
  return response.data;
};