import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  pagination: null,
  loading: false,
  error: null,
  selectedProduct: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchProductsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.products;
      state.pagination = action.payload.pagination;
    },
    fetchProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createProductRequest: (state) => {
      state.loading = true;
    },
    createProductSuccess: (state, action) => {
      state.loading = false;
      state.items = [action.payload, ...state.items];
    },
    createProductFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteProductRequest: (state) => {
      state.loading = true;
    },
    deleteProductSuccess: (state, action) => {
      state.loading = false;
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    deleteProductFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProductRequest: (state) => {
      state.loading = true;
    },
    updateProductSuccess: (state, action) => {
      state.loading = false;
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedProduct && state.selectedProduct.id === action.payload.id) {
        state.selectedProduct = action.payload;
      }
    },
    updateProductFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
  },
});

export const {
  fetchProductsRequest,
  fetchProductsSuccess,
  fetchProductsFailure,
  createProductRequest,
  createProductSuccess,
  createProductFailure,
  deleteProductRequest,
  deleteProductSuccess,
  deleteProductFailure,
  updateProductRequest,
  updateProductSuccess,
  updateProductFailure,
  setSelectedProduct,
} = productsSlice.actions;

export default productsSlice.reducer;
