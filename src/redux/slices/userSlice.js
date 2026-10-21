import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    selectedUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUsers: (state, action) => {
      state.list = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
});

export const { setUsers, setSelectedUser, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;