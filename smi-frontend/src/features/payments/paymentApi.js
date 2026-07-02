import { baseApi } from '@/api/baseApi'

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Verify a Razorpay payment after the JS SDK returns success.
     *
     * Payload:
     *   razorpay_order_id   — from order.payment.transactionId
     *   razorpay_payment_id — from Razorpay success callback
     *   razorpay_signature  — from Razorpay success callback
     *
     * On success: backend marks order as paid + confirmed, clears cart.
     */
    verifyPayment: builder.mutation({
      query: (body) => ({
        url: '/api/payments/verify',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Cart', 'Order'],
    }),
  }),
})

export const { useVerifyPaymentMutation } = paymentApi
