import { call, put, takeEvery } from 'redux-saga/effects';
import client from '../../api/client';
import {
  fetchProductRevenueFailure,
  fetchProductRevenueRequest,
  fetchProductRevenueSuccess,
} from './revenueSlice';

function* handleFetchProductRevenue() {
  try {
    const response = yield call(client.get, '/orders/revenue/products');
    yield put(fetchProductRevenueSuccess(response.data.data));
  } catch (error) {
    yield put(fetchProductRevenueFailure(error.response?.data?.message || 'Unable to load product revenue'));
  }
}

function* watchRevenue() {
  yield takeEvery(fetchProductRevenueRequest.type, handleFetchProductRevenue);
}

export function* revenueSaga() {
  yield watchRevenue();
}
