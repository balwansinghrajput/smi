import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  pagination: null,
  loading: false,
  error: null,
  selectedReview: null,
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    fetchReviewsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchReviewsSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.reviews;
      state.pagination = action.payload.pagination;
    },
    fetchReviewsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateReviewStatusRequest: (state) => {
      state.loading = true;
    },
    updateReviewStatusSuccess: (state, action) => {
      state.loading = false;
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    updateReviewStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteReviewRequest: (state) => {
      state.loading = true;
    },
    deleteReviewSuccess: (state, action) => {
      state.loading = false;
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    deleteReviewFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedReview: (state, action) => {
      state.selectedReview = action.payload;
    },
  },
});

export const {
  fetchReviewsRequest,
  fetchReviewsSuccess,
  fetchReviewsFailure,
  updateReviewStatusRequest,
  updateReviewStatusSuccess,
  updateReviewStatusFailure,
  deleteReviewRequest,
  deleteReviewSuccess,
  deleteReviewFailure,
  setSelectedReview,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;
