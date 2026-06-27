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
} = checkoutSlice.actions

export const selectCheckout = (state) => state.checkout
export const selectShippingAddress = (state) => state.checkout.shippingAddress

export default checkoutSlice.reducer
