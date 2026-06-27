import { call, put, takeLatest } from 'redux-saga/effects'
import { apiClient } from '@/api/http'
import { showToast } from '@/features/ui/uiSlice'
import { submitReview, submitReviewFailure, submitReviewSuccess } from './reviewsSlice'

function* submitReviewWorker(action) {
  try {
    const { productId, rating, comment } = action.payload
    const response = yield call([apiClient, apiClient.post], '/api/reviews', {
      productId,
      rating: Number(rating),
      comment,
    })

    yield put(
      submitReviewSuccess({
        productId,
        reviews: response.data.reviews,
      })
    )
    yield put(showToast({ type: 'success', message: 'Review submitted' }))
  } catch {
    yield put(submitReviewFailure())
    yield put(showToast({ type: 'error', message: 'Unable to submit review' }))
  }
}

export default function* reviewsSaga() {
  yield takeLatest(submitReview.type, submitReviewWorker)
}
