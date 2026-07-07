import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authReducer from '../features/auth/authSlice';
import productsReducer from '../features/products/productsSlice';
import adminsReducer from '../features/admins/adminsSlice';
import categoriesReducer from '../features/categories/categoriesSlice';
import brandsReducer from '../features/brands/brandsSlice';
import ordersReducer from '../features/orders/ordersSlice';
import usersReducer from '../features/users/usersSlice';
import reviewsReducer from '../features/reviews/reviewsSlice';
import couponsReducer from '../features/coupons/couponsSlice';
import settingsReducer from '../features/settings/settingsSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import uiReducer from '../features/ui/uiSlice';
import revenueReducer from '../features/revenue/revenueSlice';
import shippingReducer from '../features/shipping/shippingSlice';
import rootSaga from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    admins: adminsReducer,
    categories: categoriesReducer,
    brands: brandsReducer,
    orders: ordersReducer,
    users: usersReducer,
    reviews: reviewsReducer,
    coupons: couponsReducer,
    settings: settingsReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
    revenue: revenueReducer,
    shipping: shippingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;
