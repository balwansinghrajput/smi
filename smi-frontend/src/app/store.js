import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import createSagaMiddleware from 'redux-saga'
import { baseApi } from '@/api/baseApi'
import rootSaga from './rootSaga'
import authReducer from '@/features/auth/authSlice'
import productReducer from '@/features/products/productSlice'
import categoryReducer from '@/features/categories/categorySlice'
import cartReducer from '@/features/cart/cartSlice'
import uiReducer from '@/features/ui/uiSlice'
import reviewsReducer from '@/features/reviews/reviewsSlice'
import checkoutReducer from '@/features/checkout/checkoutSlice'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    cart: cartReducer,
    ui: uiReducer,
    reviews: reviewsReducer,
    checkout: checkoutReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, sagaMiddleware),
})

sagaMiddleware.run(rootSaga)
setupListeners(store.dispatch)

export default store
