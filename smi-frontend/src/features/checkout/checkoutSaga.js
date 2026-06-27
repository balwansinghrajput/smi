import { call, put, select, takeLatest } from 'redux-saga/effects'
import { apiClient } from '@/api/http'
import { clearCart } from '@/features/cart/cartSlice'
import { showToast } from '@/features/ui/uiSlice'
import { placeOrder, placeOrderFailure, placeOrderSuccess } from './checkoutSlice'

function* placeOrderWorker() {
  try {
    const checkout = yield select((state) => state.checkout)
    yield call([apiClient, apiClient.post], '/api/checkout', {
      shippingAddress: checkout.shippingAddress,
      deliveryOption: checkout.deliveryOption,
      paymentMethod: checkout.paymentMethod,
    })
    yield put(placeOrderSuccess())
    yield put(clearCart())
    yield put(showToast({ type: 'success', message: 'Order placed successfully' }))
  } catch {
    yield put(placeOrderFailure())
    yield put(showToast({ type: 'error', message: 'Unable to place order' }))
  }
}

export default function* checkoutSaga() {
  yield takeLatest(placeOrder.type, placeOrderWorker)
}
