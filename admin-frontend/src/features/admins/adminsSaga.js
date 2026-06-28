import { call, put, takeEvery } from 'redux-saga/effects';
import client from '../../api/client';
import { fetchAdminsFailure, fetchAdminsRequest, fetchAdminsSuccess } from './adminsSlice';

function* handleFetchAdmins() {
  try {
    const response = yield call(client.get, '/admins');
    yield put(fetchAdminsSuccess(response.data));
  } catch (error) {
    yield put(fetchAdminsFailure(error.response?.data?.message || 'Unable to load admins'));
  }
}

function* watchAdmins() {
  yield takeEvery(fetchAdminsRequest.type, handleFetchAdmins);
}

export function* adminsSaga() {
  yield watchAdmins();
}
