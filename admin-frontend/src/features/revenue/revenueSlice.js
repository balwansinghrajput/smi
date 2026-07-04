import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  productsRevenue: [],
  loading: false,
  error: null,
};

const revenueSlice = createSlice({
  name: 'revenue',
  initialState,
  reducers: {
    fetchProductRevenueRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductRevenueSuccess: (state, action) => {
      state.loading = false;
      state.productsRevenue = action.payload;
    },
    fetchProductRevenueFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchProductRevenueRequest,
  fetchProductRevenueSuccess,
  fetchProductRevenueFailure,
} = revenueSlice.actions;

export default revenueSlice.reducer;
