import { call, put, takeEvery } from 'redux-saga/effects';
import client from '../../api/client';
import { 
  fetchReviewsRequest, fetchReviewsSuccess, fetchReviewsFailure,
  updateReviewStatusRequest, updateReviewStatusSuccess, updateReviewStatusFailure,
  deleteReviewRequest, deleteReviewSuccess, deleteReviewFailure
} from './reviewsSlice';

function* handleFetchReviews() {
  try {
    const response = yield call(client.get, '/reviews');
    yield put(fetchReviewsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchReviewsFailure(error.response?.data?.message || 'Unable to load reviews'));
  }
}

function* handleUpdateReviewStatus(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(client.put, `/reviews/${id}/status`, data);
    yield put(updateReviewStatusSuccess(response.data.data));
  } catch (error) {
    yield put(updateReviewStatusFailure(error.response?.data?.message || 'Unable to update review'));
  }
}

function* handleDeleteReview(action) {
  try {
    yield call(client.delete, `/reviews/${action.payload}`);
    yield put(deleteReviewSuccess(action.payload));
  } catch (error) {
    yield put(deleteReviewFailure(error.response?.data?.message || 'Unable to delete review'));
  }
}

export function* reviewsSaga() {
  yield takeEvery(fetchReviewsRequest.type, handleFetchReviews);
  yield takeEvery(updateReviewStatusRequest.type, handleUpdateReviewStatus);
  yield takeEvery(deleteReviewRequest.type, handleDeleteReview);
}
