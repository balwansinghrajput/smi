import { call, put, takeEvery } from 'redux-saga/effects';
import axios from 'axios';
import client from '../../api/client';
import { createProductFailure, createProductRequest, createProductSuccess, deleteProductFailure, deleteProductRequest, deleteProductSuccess, fetchProductsFailure, fetchProductsRequest, fetchProductsSuccess } from './productsSlice';

function* handleFetchProducts() {
  try {
    const response = yield call(client.get, '/products');
    yield put(fetchProductsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchProductsFailure(error.response?.data?.message || 'Unable to load products'));
  }
}

function* handleCreateProduct(action) {
  try {
    const formData = new FormData();
    Object.entries(action.payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const response = yield call(client.post, '/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    yield put(createProductSuccess(response.data.data));
  } catch (error) {
    yield put(createProductFailure(error.response?.data?.message || 'Unable to create product'));
  }
}

function* handleDeleteProduct(action) {
  try {
    yield call(client.delete, `/products/${action.payload}`);
    yield put(deleteProductSuccess(action.payload));
  } catch (error) {
    yield put(deleteProductFailure(error.response?.data?.message || 'Unable to delete product'));
  }
}

function* watchProducts() {
  yield takeEvery(fetchProductsRequest.type, handleFetchProducts);
  yield takeEvery(createProductRequest.type, handleCreateProduct);
  yield takeEvery(deleteProductRequest.type, handleDeleteProduct);
}

export function* productsSaga() {
  yield watchProducts();
}
