import { baseApi } from '@/api/baseApi'

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/checkout — place an order (COD or online)
    checkout: builder.mutation({
      query: (body) => ({
        url: '/api/checkout',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Cart', 'Order'],
    }),

    // GET /api/orders — list all orders for current user
    getOrders: builder.query({
      query: () => '/api/orders',
      providesTags: ['Order'],
    }),

    // GET /api/orders/:id — get a single order
    getOrderById: builder.query({
      query: (orderId) => `/api/orders/${orderId}`,
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
    }),

    // PUT /api/orders/cancel/:id — cancel an order
    cancelOrder: builder.mutation({
      query: (orderId) => ({
        url: `/api/orders/cancel/${orderId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
})

export const {
  useCheckoutMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
} = checkoutApi
