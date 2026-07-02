import { call, put, takeEvery } from 'redux-saga/effects';
import client from '../../api/client';
import { 
  fetchDashboardRequest, fetchDashboardSuccess, fetchDashboardFailure
} from './dashboardSlice';

function* handleFetchDashboard() {
  try {
    const response = yield call(client.get, '/dashboard/summary');
    yield put(fetchDashboardSuccess(response.data.data));
  } catch (error) {
    yield put(fetchDashboardFailure(error.response?.data?.message || 'Unable to load dashboard data'));
  }
}

export function* dashboardSaga() {
  yield takeEvery(fetchDashboardRequest.type, handleFetchDashboard);
}
