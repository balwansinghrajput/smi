import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    fetchSettingsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSettingsSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload;
    },
    fetchSettingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateSettingsRequest: (state) => {
      state.loading = true;
    },
    updateSettingsSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload;
    },
    updateSettingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchSettingsRequest,
  fetchSettingsSuccess,
  fetchSettingsFailure,
  updateSettingsRequest,
  updateSettingsSuccess,
  updateSettingsFailure,
} = settingsSlice.actions;

export default settingsSlice.reducer;
