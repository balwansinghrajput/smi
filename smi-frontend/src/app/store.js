import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from '@/api/baseApi'
import authReducer from '@/features/auth/authSlice'
import productReducer from '@/features/products/productSlice'
import categoryReducer from '@/features/categories/categorySlice'
import cartReducer from '@/features/cart/cartSlice'
import uiReducer from '@/features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    cart: cartReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

setupListeners(store.dispatch)

export default store
