import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  pagination: null,
  loading: false,
  error: null,
  selectedBrand: null,
};

const brandsSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    fetchBrandsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBrandsSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.brands;
      state.pagination = action.payload.pagination;
    },
    fetchBrandsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createBrandRequest: (state) => {
      state.loading = true;
    },
    createBrandSuccess: (state, action) => {
      state.loading = false;
      state.items = [action.payload, ...state.items];
    },
    createBrandFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateBrandRequest: (state) => {
      state.loading = true;
    },
    updateBrandSuccess: (state, action) => {
      state.loading = false;
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    updateBrandFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteBrandRequest: (state) => {
      state.loading = true;
    },
    deleteBrandSuccess: (state, action) => {
      state.loading = false;
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    deleteBrandFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedBrand: (state, action) => {
      state.selectedBrand = action.payload;
    },
  },
});

export const {
  fetchBrandsRequest,
  fetchBrandsSuccess,
  fetchBrandsFailure,
  createBrandRequest,
  createBrandSuccess,
  createBrandFailure,
  updateBrandRequest,
  updateBrandSuccess,
  updateBrandFailure,
  deleteBrandRequest,
  deleteBrandSuccess,
  deleteBrandFailure,
  setSelectedBrand,
} = brandsSlice.actions;

export default brandsSlice.reducer;
