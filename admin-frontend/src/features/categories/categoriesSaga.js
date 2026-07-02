import { call, put, takeEvery } from 'redux-saga/effects';
import client from '../../api/client';
import { 
  fetchCategoriesRequest, fetchCategoriesSuccess, fetchCategoriesFailure,
  createCategoryRequest, createCategorySuccess, createCategoryFailure,
  updateCategoryRequest, updateCategorySuccess, updateCategoryFailure,
  deleteCategoryRequest, deleteCategorySuccess, deleteCategoryFailure
} from './categoriesSlice';

function* handleFetchCategories() {
  try {
    const response = yield call(client.get, '/categories');
    yield put(fetchCategoriesSuccess(response.data.data));
  } catch (error) {
    yield put(fetchCategoriesFailure(error.response?.data?.message || 'Unable to load categories'));
  }
}

function* handleCreateCategory(action) {
  try {
    const formData = new FormData();
    Object.entries(action.payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const response = yield call(client.post, '/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    yield put(createCategorySuccess(response.data.data));
  } catch (error) {
    yield put(createCategoryFailure(error.response?.data?.message || 'Unable to create category'));
  }
}

function* handleUpdateCategory(action) {
  try {
    const { id, data } = action.payload;
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const response = yield call(client.put, `/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    yield put(updateCategorySuccess(response.data.data));
  } catch (error) {
    yield put(updateCategoryFailure(error.response?.data?.message || 'Unable to update category'));
  }
}

function* handleDeleteCategory(action) {
  try {
    yield call(client.delete, `/categories/${action.payload}`);
    yield put(deleteCategorySuccess(action.payload));
  } catch (error) {
    yield put(deleteCategoryFailure(error.response?.data?.message || 'Unable to delete category'));
  }
}

export function* categoriesSaga() {
  yield takeEvery(fetchCategoriesRequest.type, handleFetchCategories);
  yield takeEvery(createCategoryRequest.type, handleCreateCategory);
  yield takeEvery(updateCategoryRequest.type, handleUpdateCategory);
  yield takeEvery(deleteCategoryRequest.type, handleDeleteCategory);
}
