import { all, fork } from 'redux-saga/effects'
import reviewsSaga from '@/features/reviews/reviewsSaga'
import checkoutSaga from '@/features/checkout/checkoutSaga'

export default function* rootSaga() {
  yield all([fork(reviewsSaga), fork(checkoutSaga)])
}
