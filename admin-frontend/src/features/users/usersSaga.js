import { call, put, takeEvery } from 'redux-saga/effects';
import client from '../../api/client';
import { 
  fetchUsersRequest, fetchUsersSuccess, fetchUsersFailure,
  updateUserRequest, updateUserSuccess, updateUserFailure,
  deleteUserRequest, deleteUserSuccess, deleteUserFailure
} from './usersSlice';

function* handleFetchUsers() {
  try {
    const response = yield call(client.get, '/users');
    yield put(fetchUsersSuccess(response.data.data));
  } catch (error) {
    yield put(fetchUsersFailure(error.response?.data?.message || 'Unable to load users'));
  }
}

function* handleUpdateUser(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(client.put, `/users/${id}`, data);
    yield put(updateUserSuccess(response.data.data));
  } catch (error) {
    yield put(updateUserFailure(error.response?.data?.message || 'Unable to update user'));
  }
}

function* handleDeleteUser(action) {
  try {
    yield call(client.delete, `/users/${action.payload}`);
    yield put(deleteUserSuccess(action.payload));
  } catch (error) {
    yield put(deleteUserFailure(error.response?.data?.message || 'Unable to delete user'));
  }
}

export function* usersSaga() {
  yield takeEvery(fetchUsersRequest.type, handleFetchUsers);
  yield takeEvery(updateUserRequest.type, handleUpdateUser);
  yield takeEvery(deleteUserRequest.type, handleDeleteUser);
}
