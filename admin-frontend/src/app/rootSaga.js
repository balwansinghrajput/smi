import { all, fork } from 'redux-saga/effects';
import { authSaga } from '../features/auth/authSaga';
import { productsSaga } from '../features/products/productsSaga';
import { adminsSaga } from '../features/admins/adminsSaga';
import { categoriesSaga } from '../features/categories/categoriesSaga';
import { brandsSaga } from '../features/brands/brandsSaga';
import { ordersSaga } from '../features/orders/ordersSaga';
import { usersSaga } from '../features/users/usersSaga';
import { reviewsSaga } from '../features/reviews/reviewsSaga';
import { couponsSaga } from '../features/coupons/couponsSaga';
import { settingsSaga } from '../features/settings/settingsSaga';
import { dashboardSaga } from '../features/dashboard/dashboardSaga';
import { revenueSaga } from '../features/revenue/revenueSaga';

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(productsSaga),
    fork(adminsSaga),
    fork(categoriesSaga),
    fork(brandsSaga),
    fork(ordersSaga),
    fork(usersSaga),
    fork(reviewsSaga),
    fork(couponsSaga),
    fork(settingsSaga),
    fork(dashboardSaga),
    fork(revenueSaga),
  ]);
}

export default rootSaga;
