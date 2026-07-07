import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  pagination: null,
  loading: false,
  error: null,
  createError: null,
  selectedCoupon: null,
  analytics: null,
  analyticsLoading: false,
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
      state.createError = null;
    },
    createCouponSuccess: (state, action) => {
      state.loading = false;
      state.items = [action.payload, ...state.items];
      state.createError = null;
    },
    createCouponFailure: (state, action) => {
      state.loading = false;
      state.createError = action.payload;
    },

    updateCouponRequest: (state) => {
      state.loading = true;
      state.createError = null;
    },
    updateCouponSuccess: (state, action) => {
      state.loading = false;
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
      state.createError = null;
    },
    updateCouponFailure: (state, action) => {
      state.loading = false;
      state.createError = action.payload;
    },

    toggleCouponRequest: (state) => {
      state.loading = true;
    },
    toggleCouponSuccess: (state, action) => {
      state.loading = false;
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
    toggleCouponFailure: (state, action) => {
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
    clearCreateError: (state) => {
      state.createError = null;
    },

    fetchCouponAnalyticsRequest: (state) => {
      state.analyticsLoading = true;
      state.analytics = null;
    },
    fetchCouponAnalyticsSuccess: (state, action) => {
      state.analyticsLoading = false;
      state.analytics = action.payload;
    },
    fetchCouponAnalyticsFailure: (state, action) => {
      state.analyticsLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchCouponsRequest, fetchCouponsSuccess, fetchCouponsFailure,
  createCouponRequest, createCouponSuccess, createCouponFailure,
  updateCouponRequest, updateCouponSuccess, updateCouponFailure,
  toggleCouponRequest, toggleCouponSuccess, toggleCouponFailure,
  deleteCouponRequest, deleteCouponSuccess, deleteCouponFailure,
  setSelectedCoupon, clearCreateError,
  fetchCouponAnalyticsRequest, fetchCouponAnalyticsSuccess, fetchCouponAnalyticsFailure,
} = couponsSlice.actions;

export default couponsSlice.reducer;
