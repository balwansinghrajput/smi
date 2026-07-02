import { call, put, takeEvery } from 'redux-saga/effects';
import client from '../../api/client';
import { 
  fetchOrdersRequest, fetchOrdersSuccess, fetchOrdersFailure,
  updateOrderStatusRequest, updateOrderStatusSuccess, updateOrderStatusFailure,
  deleteOrderRequest, deleteOrderSuccess, deleteOrderFailure
} from './ordersSlice';

function* handleFetchOrders() {
  try {
    const response = yield call(client.get, '/orders');
    yield put(fetchOrdersSuccess(response.data.data));
  } catch (error) {
    yield put(fetchOrdersFailure(error.response?.data?.message || 'Unable to load orders'));
  }
}

function* handleUpdateOrderStatus(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(client.put, `/orders/${id}/status`, data);
    yield put(updateOrderStatusSuccess(response.data.data));
  } catch (error) {
    yield put(updateOrderStatusFailure(error.response?.data?.message || 'Unable to update order'));
  }
}

function* handleDeleteOrder(action) {
  try {
    yield call(client.delete, `/orders/${action.payload}`);
    yield put(deleteOrderSuccess(action.payload));
  } catch (error) {
    yield put(deleteOrderFailure(error.response?.data?.message || 'Unable to delete order'));
  }
}

export function* ordersSaga() {
  yield takeEvery(fetchOrdersRequest.type, handleFetchOrders);
  yield takeEvery(updateOrderStatusRequest.type, handleUpdateOrderStatus);
  yield takeEvery(deleteOrderRequest.type, handleDeleteOrder);
}
