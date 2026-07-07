import { call, put, takeEvery } from 'redux-saga/effects';
import client from '../../api/client';
import {
  fetchMethodsRequest,
  fetchMethodsSuccess,
  fetchMethodsFailure,
  createMethodRequest,
  createMethodSuccess,
  createMethodFailure,
  updateMethodRequest,
  updateMethodSuccess,
  updateMethodFailure,
  toggleMethodRequest,
  toggleMethodSuccess,
  toggleMethodFailure,
  deleteMethodRequest,
  deleteMethodSuccess,
  deleteMethodFailure,
} from './shippingSlice';
import { toast } from 'react-hot-toast';

function* handleFetchMethods() {
  try {
    const response = yield call(client.get, '/shipping/methods');
    yield put(fetchMethodsSuccess(response.data));
  } catch (error) {
    yield put(fetchMethodsFailure(error.response?.data?.detail || 'Unable to load delivery methods'));
  }
}

function* handleCreateMethod(action) {
  try {
    const response = yield call(client.post, '/shipping/methods', action.payload);
    yield put(createMethodSuccess(response.data));
    toast.success('Delivery method created successfully');
    if (action.meta && action.meta.onSuccess) {
      action.meta.onSuccess();
    }
  } catch (error) {
    yield put(createMethodFailure(error.response?.data?.detail || 'Unable to create delivery method'));
    toast.error(error.response?.data?.detail || 'Unable to create delivery method');
  }
}

function* handleUpdateMethod(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(client.put, `/shipping/methods/${id}`, data);
    yield put(updateMethodSuccess(response.data));
    toast.success('Delivery method updated successfully');
    if (action.meta && action.meta.onSuccess) {
      action.meta.onSuccess();
    }
  } catch (error) {
    yield put(updateMethodFailure(error.response?.data?.detail || 'Unable to update delivery method'));
    toast.error(error.response?.data?.detail || 'Unable to update delivery method');
  }
}

function* handleToggleMethod(action) {
  try {
    const response = yield call(client.patch, `/shipping/methods/${action.payload}/toggle`);
    yield put(toggleMethodSuccess(response.data));
    toast.success('Delivery method status updated');
  } catch (error) {
    yield put(toggleMethodFailure(error.response?.data?.detail || 'Unable to toggle status'));
    toast.error(error.response?.data?.detail || 'Unable to toggle status');
  }
}

function* handleDeleteMethod(action) {
  try {
    yield call(client.delete, `/shipping/methods/${action.payload}`);
    yield put(deleteMethodSuccess(action.payload));
    toast.success('Delivery method deleted successfully');
  } catch (error) {
    yield put(deleteMethodFailure(error.response?.data?.detail || 'Unable to delete delivery method'));
    toast.error(error.response?.data?.detail || 'Unable to delete delivery method');
  }
}

export function* shippingSaga() {
  yield takeEvery(fetchMethodsRequest.type, handleFetchMethods);
  yield takeEvery(createMethodRequest.type, handleCreateMethod);
  yield takeEvery(updateMethodRequest.type, handleUpdateMethod);
  yield takeEvery(toggleMethodRequest.type, handleToggleMethod);
  yield takeEvery(deleteMethodRequest.type, handleDeleteMethod);
}
