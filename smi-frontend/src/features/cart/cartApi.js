import { baseApi } from '@/api/baseApi'

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => '/api/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (body) => ({
        url: '/api/cart/add',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: (body) => ({
        url: '/api/cart/update',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Cart'],
    }),
    increaseCartItem: builder.mutation({
      query: (productId) => ({
        url: `/api/cart/increase/${productId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Cart'],
    }),
    decreaseCartItem: builder.mutation({
      query: (productId) => ({
        url: `/api/cart/decrease/${productId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: `/api/cart/remove/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCartRemote: builder.mutation({
      query: () => ({
        url: '/api/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
})

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useIncreaseCartItemMutation,
  useDecreaseCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartRemoteMutation,
} = cartApi
