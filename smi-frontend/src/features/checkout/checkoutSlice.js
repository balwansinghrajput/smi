import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  shippingAddress: {
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  },
  deliveryOption: 'standard',
  paymentMethod: 'cod',
  placingOrder: false,
  orderPlaced: false,
  // ── Coupon state ──────────────────────────────────────────────────────────
  couponCode: '',          // raw input value
  appliedCoupon: null,     // { code, discount_type, discount_value, max_discount, discount_amount }
  couponError: null,
  couponLoading: false,
}

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    updateShippingAddress: (state, action) => {
      state.shippingAddress = { ...state.shippingAddress, ...action.payload }
    },
    setDeliveryOption: (state, action) => {
      state.deliveryOption = action.payload
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload
    },
    placeOrder: (state) => {
      state.placingOrder = true
      state.orderPlaced = false
    },
    placeOrderSuccess: (state) => {
      state.placingOrder = false
      state.orderPlaced = true
    },
    placeOrderFailure: (state) => {
      state.placingOrder = false
    },
    resetCheckout: () => initialState,

    // ── Coupon actions ───────────────────────────────────────────────────────
    setCouponCode: (state, action) => {
      state.couponCode = action.payload
      // Clear error when user edits the input
      state.couponError = null
    },
    applyCouponStart: (state) => {
      state.couponLoading = true
      state.couponError = null
    },
    applyCouponSuccess: (state, action) => {
      state.couponLoading = false
      state.appliedCoupon = action.payload   // full validate response
      state.couponError = null
    },
    applyCouponFailure: (state, action) => {
      state.couponLoading = false
      state.appliedCoupon = null
      state.couponError = action.payload
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null
      state.couponCode = ''
      state.couponError = null
    },
  },
})

export const {
  updateShippingAddress,
  setDeliveryOption,
  setPaymentMethod,
  placeOrder,
  placeOrderSuccess,
  placeOrderFailure,
  resetCheckout,
  setCouponCode,
  applyCouponStart,
  applyCouponSuccess,
  applyCouponFailure,
  removeCoupon,
} = checkoutSlice.actions

export const selectCheckout = (state) => state.checkout
export const selectShippingAddress = (state) => state.checkout.shippingAddress
export const selectAppliedCoupon = (state) => state.checkout.appliedCoupon

export default checkoutSlice.reducer
