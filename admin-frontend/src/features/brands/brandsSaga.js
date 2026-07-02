import { call, put, takeEvery } from 'redux-saga/effects';
import client from '../../api/client';
import { 
  fetchBrandsRequest, fetchBrandsSuccess, fetchBrandsFailure,
  createBrandRequest, createBrandSuccess, createBrandFailure,
  updateBrandRequest, updateBrandSuccess, updateBrandFailure,
  deleteBrandRequest, deleteBrandSuccess, deleteBrandFailure
} from './brandsSlice';

function* handleFetchBrands() {
  try {
    const response = yield call(client.get, '/brands');
    yield put(fetchBrandsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchBrandsFailure(error.response?.data?.message || 'Unable to load brands'));
  }
}

function* handleCreateBrand(action) {
  try {
    const formData = new FormData();
    Object.entries(action.payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const response = yield call(client.post, '/brands', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    yield put(createBrandSuccess(response.data.data));
  } catch (error) {
    yield put(createBrandFailure(error.response?.data?.message || 'Unable to create brand'));
  }
}

function* handleUpdateBrand(action) {
  try {
    const { id, data } = action.payload;
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const response = yield call(client.put, `/brands/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    yield put(updateBrandSuccess(response.data.data));
  } catch (error) {
    yield put(updateBrandFailure(error.response?.data?.message || 'Unable to update brand'));
  }
}

function* handleDeleteBrand(action) {
  try {
    yield call(client.delete, `/brands/${action.payload}`);
    yield put(deleteBrandSuccess(action.payload));
  } catch (error) {
    yield put(deleteBrandFailure(error.response?.data?.message || 'Unable to delete brand'));
  }
}

export function* brandsSaga() {
  yield takeEvery(fetchBrandsRequest.type, handleFetchBrands);
  yield takeEvery(createBrandRequest.type, handleCreateBrand);
  yield takeEvery(updateBrandRequest.type, handleUpdateBrand);
  yield takeEvery(deleteBrandRequest.type, handleDeleteBrand);
}
