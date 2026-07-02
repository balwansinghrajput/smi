import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  pagination: null,
  loading: false,
  error: null,
  selectedCoupon: null,
};

const couponsSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    fetchCouponsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCouponsSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.coupons;
      state.pagination = action.payload.pagination;
    },
    fetchCouponsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createCouponRequest: (state) => {
      state.loading = true;
    },
    createCouponSuccess: (state, action) => {
      state.loading = false;
      state.items = [action.payload, ...state.items];
    },
    createCouponFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateCouponRequest: (state) => {
      state.loading = true;
    },
    updateCouponSuccess: (state, action) => {
      state.loading = false;
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    updateCouponFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteCouponRequest: (state) => {
      state.loading = true;
    },
    deleteCouponSuccess: (state, action) => {
      state.loading = false;
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    deleteCouponFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedCoupon: (state, action) => {
      state.selectedCoupon = action.payload;
    },
  },
});

export const {
  fetchCouponsRequest,
  fetchCouponsSuccess,
  fetchCouponsFailure,
  createCouponRequest,
  createCouponSuccess,
  createCouponFailure,
  updateCouponRequest,
  updateCouponSuccess,
  updateCouponFailure,
  deleteCouponRequest,
  deleteCouponSuccess,
  deleteCouponFailure,
  setSelectedCoupon,
} = couponsSlice.actions;

export default couponsSlice.reducer;
