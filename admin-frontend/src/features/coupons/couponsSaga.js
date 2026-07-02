import { call, put, takeEvery } from 'redux-saga/effects';
import client from '../../api/client';
import { 
  fetchCouponsRequest, fetchCouponsSuccess, fetchCouponsFailure,
  createCouponRequest, createCouponSuccess, createCouponFailure,
  updateCouponRequest, updateCouponSuccess, updateCouponFailure,
  deleteCouponRequest, deleteCouponSuccess, deleteCouponFailure
} from './couponsSlice';

function* handleFetchCoupons() {
  try {
    const response = yield call(client.get, '/coupons');
    yield put(fetchCouponsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchCouponsFailure(error.response?.data?.message || 'Unable to load coupons'));
  }
}

function* handleCreateCoupon(action) {
  try {
    const response = yield call(client.post, '/coupons', action.payload);
    yield put(createCouponSuccess(response.data.data));
  } catch (error) {
    yield put(createCouponFailure(error.response?.data?.message || 'Unable to create coupon'));
  }
}

function* handleUpdateCoupon(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(client.put, `/coupons/${id}`, data);
    yield put(updateCouponSuccess(response.data.data));
  } catch (error) {
    yield put(updateCouponFailure(error.response?.data?.message || 'Unable to update coupon'));
  }
}

function* handleDeleteCoupon(action) {
  try {
    yield call(client.delete, `/coupons/${action.payload}`);
    yield put(deleteCouponSuccess(action.payload));
  } catch (error) {
    yield put(deleteCouponFailure(error.response?.data?.message || 'Unable to delete coupon'));
  }
}

export function* couponsSaga() {
  yield takeEvery(fetchCouponsRequest.type, handleFetchCoupons);
  yield takeEvery(createCouponRequest.type, handleCreateCoupon);
  yield takeEvery(updateCouponRequest.type, handleUpdateCoupon);
  yield takeEvery(deleteCouponRequest.type, handleDeleteCoupon);
}
