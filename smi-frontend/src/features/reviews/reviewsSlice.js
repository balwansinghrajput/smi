import { createSlice } from '@reduxjs/toolkit'

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    byProductId: {},
    submitting: false,
  },
  reducers: {
    submitReview: (state) => {
      state.submitting = true
    },
    submitReviewSuccess: (state, action) => {
      const { productId, reviews } = action.payload
      state.byProductId[productId] = reviews
      state.submitting = false
    },
    submitReviewFailure: (state) => {
      state.submitting = false
    },
  },
})

export const { submitReview, submitReviewSuccess, submitReviewFailure } =
  reviewsSlice.actions

export const selectReviewsByProductId = (productId) => (state) =>
  state.reviews.byProductId[productId] || []

export const selectReviewsSubmitting = (state) => state.reviews.submitting

export default reviewsSlice.reducer
