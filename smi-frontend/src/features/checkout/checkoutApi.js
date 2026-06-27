import { baseApi } from '@/api/baseApi'

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkout: builder.mutation({
      query: (body) => ({
        url: '/checkout',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Cart', 'Order'],
    }),
    getOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
  }),
})

export const { useCheckoutMutation, useGetOrdersQuery } = checkoutApi
