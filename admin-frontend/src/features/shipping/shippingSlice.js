import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  methods: [],
  loading: false,
  error: null,
};

const shippingSlice = createSlice({
  name: 'shipping',
  initialState,
  reducers: {
    fetchMethodsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMethodsSuccess: (state, action) => {
      state.loading = false;
      state.methods = action.payload;
    },
    fetchMethodsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createMethodRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createMethodSuccess: (state, action) => {
      state.loading = false;
      state.methods.push(action.payload);
      state.methods.sort((a, b) => a.slot - b.slot);
    },
    createMethodFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateMethodRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateMethodSuccess: (state, action) => {
      state.loading = false;
      const index = state.methods.findIndex((m) => m._id === action.payload._id);
      if (index !== -1) {
        state.methods[index] = action.payload;
      }
    },
    updateMethodFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    toggleMethodRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    toggleMethodSuccess: (state, action) => {
      state.loading = false;
      const index = state.methods.findIndex((m) => m._id === action.payload._id);
      if (index !== -1) {
        state.methods[index] = action.payload;
      }
    },
    toggleMethodFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteMethodRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteMethodSuccess: (state, action) => {
      state.loading = false;
      state.methods = state.methods.filter((m) => m._id !== action.payload);
    },
    deleteMethodFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchMethodsRequest,
  fetchMethodsSuccess,
  fetchMethodsFailure,
  createMethodRequest,
  createMethodSuccess,
  createMethodFailure,
  updateMethodRequest,
  updateMethodSuccess,
  updateMethodFailure,
  toggleMethodRequest,
  toggleMethodSuccess,
  toggleMethodFailure,
  deleteMethodRequest,
  deleteMethodSuccess,
  deleteMethodFailure,
} = shippingSlice.actions;

export default shippingSlice.reducer;
