import { all, fork } from 'redux-saga/effects';
import { authSaga } from '../features/auth/authSaga';
import { productsSaga } from '../features/products/productsSaga';
import { adminsSaga } from '../features/admins/adminsSaga';

export function* rootSaga() {
  yield all([fork(authSaga), fork(productsSaga), fork(adminsSaga)]);
}

export default rootSaga;
