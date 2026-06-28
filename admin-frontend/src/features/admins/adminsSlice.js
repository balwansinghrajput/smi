import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  pagination: null,
  loading: false,
  error: null,
};

const adminsSlice = createSlice({
  name: 'admins',
  initialState,
  reducers: {
    fetchAdminsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAdminsSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.admins;
      state.pagination = action.payload.pagination;
    },
    fetchAdminsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchAdminsRequest, fetchAdminsSuccess, fetchAdminsFailure } = adminsSlice.actions;

export default adminsSlice.reducer;
