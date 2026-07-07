import { baseApi } from '@/api/baseApi'

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /api/coupons/validate
     * Body: { code: string, subtotal: number }
     * Returns: { valid, code, discount_type, discount_value, max_discount, discount_amount, message }
     */
    validateCoupon: builder.mutation({
      query: (body) => ({
        url: '/api/coupons/validate',
        method: 'POST',
        data: body,
      }),
    }),
  }),
})

export const { useValidateCouponMutation } = couponApi
