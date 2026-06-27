import { createSlice } from '@reduxjs/toolkit'
import { cartApi } from './cartApi'

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    isOpen: false,
  },
  reducers: {
    addToCartLocal: (state, action) => {
      const { productId, quantity = 1 } = action.payload
      const existing = state.items.find((item) => item.productId === productId)

      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({
          id: `local_${productId}_${Date.now()}`,
          productId,
          quantity,
        })
      }
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find((i) => i.id === id)
      if (item) {
        item.quantity = Math.max(1, quantity)
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    clearCart: (state) => {
      state.items = []
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen
    },
    setCartOpen: (state, action) => {
      state.isOpen = action.payload
    },
    syncCartItems: (state, action) => {
      state.items = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(cartApi.endpoints.getCart.matchFulfilled, (state, action) => {
        state.items = action.payload.items
      })
      .addMatcher(cartApi.endpoints.addToCart.matchFulfilled, (state, action) => {
        state.items = action.payload.items
      })
      .addMatcher(cartApi.endpoints.updateCartItem.matchFulfilled, (state, action) => {
        state.items = action.payload.items
      })
      .addMatcher(cartApi.endpoints.increaseCartItem.matchFulfilled, (state, action) => {
        state.items = action.payload.items
      })
      .addMatcher(cartApi.endpoints.decreaseCartItem.matchFulfilled, (state, action) => {
        state.items = action.payload.items
      })
      .addMatcher(cartApi.endpoints.removeFromCart.matchFulfilled, (state, action) => {
        state.items = action.payload.items
      })
      .addMatcher(cartApi.endpoints.clearCartRemote.matchFulfilled, (state, action) => {
        state.items = action.payload.items
      })
  },
})

export const {
  addToCartLocal,
  updateQuantity,
  removeFromCart,
  clearCart,
  toggleCart,
  setCartOpen,
  syncCartItems,
} = cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectCartIsOpen = (state) => state.cart.isOpen

export const selectCartItemsWithDetails = (state) => {
  return state.cart.items
    .map((item) => {
      const product = item.product
      if (!product) return null
      return {
        ...item,
        product,
        lineTotal: item.lineTotal ?? product.price * item.quantity,
      }
    })
    .filter(Boolean)
}

export const selectCartSubtotal = (state) =>
  selectCartItemsWithDetails(state).reduce((sum, item) => sum + item.lineTotal, 0)

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

export default cartSlice.reducer
