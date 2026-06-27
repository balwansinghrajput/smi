import { baseApi } from '@/api/baseApi'

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query({
      query: (productId) => ({ url: `/api/reviews/product/${productId}` }),
      providesTags: (result, error, productId) => [{ type: 'Review', id: productId }],
    }),
    addReview: builder.mutation({
      query: (body) => ({
        url: '/api/reviews',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (result, error, body) => [{ type: 'Review', id: body.productId }],
    }),
    updateReview: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/reviews/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Review'],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/api/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
    }),
  }),
})

export const {
  useGetProductReviewsQuery,
  useAddReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi

