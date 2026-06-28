import { call, put, takeEvery } from 'redux-saga/effects';
import toast from 'react-hot-toast';
import { loginAdmin, refreshAdminToken } from '../../api/authApi';
import { loginFailure, loginRequest, loginSuccess, logout, loadProfileFailure, loadProfileRequest, loadProfileSuccess } from './authSlice';

function* handleLogin(action) {
  try {
    const response = yield call(loginAdmin, action.payload);
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('admin_access_token', access_token);
    localStorage.setItem('admin_refresh_token', refresh_token);
    yield put(loginSuccess({ user: { email: action.payload.email } }));
    toast.success('Signed in successfully');
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    yield put(loginFailure(message));
    toast.error(message);
  }
}

function* handleLogout() {
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
}

function* handleProfileLoad() {
  try {
    const token = localStorage.getItem('admin_access_token');
    if (!token) {
      yield put(loadProfileFailure('Missing token'));
      return;
    }
    const response = yield call(refreshAdminToken, { refresh_token: localStorage.getItem('admin_refresh_token') || '' });
    const { access_token } = response.data;
    localStorage.setItem('admin_access_token', access_token);
    yield put(loadProfileSuccess({ email: 'admin' }));
  } catch (error) {
    yield put(loadProfileFailure(error.response?.data?.message || 'Session expired'));
    yield put(logout());
  }
}

function* watchLogin() {
  yield takeEvery(loginRequest.type, handleLogin);
}

function* watchLogout() {
  yield takeEvery(logout.type, handleLogout);
}

function* watchProfileLoad() {
  yield takeEvery(loadProfileRequest.type, handleProfileLoad);
}

export function* authSaga() {
  yield watchLogin();
  yield watchLogout();
  yield watchProfileLoad();
}
