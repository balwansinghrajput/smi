import { call, put, takeEvery } from 'redux-saga/effects';
import client from '../../api/client';
import { 
  fetchSettingsRequest, fetchSettingsSuccess, fetchSettingsFailure,
  updateSettingsRequest, updateSettingsSuccess, updateSettingsFailure
} from './settingsSlice';

function* handleFetchSettings() {
  try {
    const response = yield call(client.get, '/settings');
    yield put(fetchSettingsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchSettingsFailure(error.response?.data?.message || 'Unable to load settings'));
  }
}

function* handleUpdateSettings(action) {
  try {
    const response = yield call(client.put, '/settings', action.payload);
    yield put(updateSettingsSuccess(response.data.data));
  } catch (error) {
    yield put(updateSettingsFailure(error.response?.data?.message || 'Unable to update settings'));
  }
}

export function* settingsSaga() {
  yield takeEvery(fetchSettingsRequest.type, handleFetchSettings);
  yield takeEvery(updateSettingsRequest.type, handleUpdateSettings);
}
