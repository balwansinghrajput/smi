import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  selectCartItemsWithDetails,
  selectCartSubtotal,
} from '@/features/cart/cartSlice'
import { useClearCartRemoteMutation, useGetCartQuery } from '@/features/cart/cartApi'
import {
  selectCheckout,
  selectAppliedCoupon,
  setDeliveryOption,
  setPaymentMethod,
  placeOrderFailure,
  placeOrderSuccess,
  updateShippingAddress,
  setCouponCode,
  applyCouponStart,
  applyCouponSuccess,
  applyCouponFailure,
  removeCoupon,
} from '@/features/checkout/checkoutSlice'
import { useCheckoutMutation } from '@/features/checkout/checkoutApi'
import { useValidateCouponMutation } from '@/features/checkout/couponApi'
import { useVerifyPaymentMutation } from '@/features/payments/paymentApi'
import { selectIsAuthenticated, selectCurrentUser } from '@/features/auth/authSlice'
import { showToast } from '@/features/ui/uiSlice'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT, TAX_RATE } from '@/constants'
import { formatCurrency, validateEmail, validatePhone } from '@/utils'
import { openRazorpayModal } from '@/utils/razorpay'

// ─── Delivery options ──────────────────────────────────────────────────────────
const deliveryOptions = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Delivery in 3–5 business days',
    amount: 0,
    icon: '📦',
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Priority delivery in 1–2 business days',
    amount: 149,
    icon: '⚡',
  },
]

// ─── Payment methods ───────────────────────────────────────────────────────────
const paymentMethods = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: '💵',
    badge: null,
  },
  {
    id: 'online',
    name: 'Online Payment',
    description: 'UPI · Cards · Net Banking · Wallets',
    icon: '⚡',
    badge: 'Powered by Razorpay',
  },
]

// ─── Razorpay badge ────────────────────────────────────────────────────────────
function RazorpayBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-blue-400" aria-hidden="true">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zm-5.69 14.71l-3.26-5.2-1.8 5.2H8l2.73-8.22h1.76l3.27 5.2 1.8-5.2h1.76L16.57 16.7h-1.76z" />
      </svg>
      Razorpay Secured
    </span>
  )
}

// ─── Coupon Input Section ──────────────────────────────────────────────────────
function CouponSection({ subtotal }) {
  const dispatch = useAppDispatch()
  const { couponCode, couponLoading, couponError } = useAppSelector(selectCheckout)
  const appliedCoupon = useAppSelector(selectAppliedCoupon)
  const [validateCoupon] = useValidateCouponMutation()

  const handleApply = async () => {
    const trimmed = couponCode.trim()
    if (!trimmed) return
    dispatch(applyCouponStart())
    try {
      const result = await validateCoupon({ code: trimmed, subtotal }).unwrap()
      dispatch(applyCouponSuccess(result))
      dispatch(showToast({ type: 'success', message: result.message }))
    } catch (err) {
      const msg = err?.data?.message || 'Invalid coupon code'
      dispatch(applyCouponFailure(msg))
    }
  }

  const handleRemove = () => {
    dispatch(removeCoupon())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleApply()
    }
  }

  return (
    <section className="card" aria-labelledby="coupon-heading">
      <h2 id="coupon-heading" className="text-xl font-semibold text-text">
        Coupon Code
      </h2>

      {appliedCoupon ? (
        /* ── Applied state ─────────────────────────────────────────────── */
        <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/20">
              <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-mono text-sm font-bold tracking-widest text-success">
                {appliedCoupon.code}
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {appliedCoupon.discount_type === 'percentage'
                  ? `${appliedCoupon.discount_value}% off${appliedCoupon.max_discount ? ` (max ${formatCurrency(appliedCoupon.max_discount)})` : ''}`
                  : `${formatCurrency(appliedCoupon.discount_value)} off`}
                {' · '}
                <span className="font-semibold text-success">
                  You save {formatCurrency(appliedCoupon.discount_amount)}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-error/10 hover:text-error"
            aria-label="Remove coupon"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        /* ── Input state ───────────────────────────────────────────────── */
        <div className="mt-4">
          <div className="flex gap-2">
            <input
              id="coupon-input"
              type="text"
              value={couponCode}
              onChange={(e) => dispatch(setCouponCode(e.target.value.toUpperCase()))}
              onKeyDown={handleKeyDown}
              placeholder="ENTER CODE"
              className="input-field flex-1 font-mono uppercase tracking-widest"
              autoComplete="off"
              spellCheck={false}
              aria-label="Coupon code"
              aria-describedby={couponError ? 'coupon-error' : undefined}
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={!couponCode.trim() || couponLoading}
              className="shrink-0 rounded-lg border border-accent bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {couponLoading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Apply'
              )}
            </button>
          </div>
          {couponError && (
            <p id="coupon-error" role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-error">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {couponError}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

// ─── Order Success Screen ──────────────────────────────────────────────────────
function OrderSuccess({ order, navigate }) {
  const isPaid = order?.payment?.status === 'paid'
  return (
    <div className="section-padding container-app text-center">
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-secondary p-10">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            isPaid ? 'bg-success/20' : 'bg-accent/20'
          }`}
        >
          <svg
            className={`h-10 w-10 ${isPaid ? 'text-success' : 'text-accent'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-text">Order Placed!</h1>
        <p className="mt-3 text-muted">
          {isPaid
            ? 'Your payment was successful and your order is confirmed.'
            : 'Your order has been received. Pay on delivery.'}
        </p>
        {order?.id && (
          <p className="mt-2 font-mono text-xs text-muted">
            Order ID: <span className="text-accent">{order.id}</span>
          </p>
        )}
        {order?.discount > 0 && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-sm font-semibold text-success">
            🎉 You saved {formatCurrency(order.discount)} with coupon{order.couponCode ? ` ${order.couponCode}` : ''}!
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => navigate('/orders')} className="btn-primary">
            View My Orders
          </button>
          <button type="button" onClick={() => navigate('/products')} className="btn-secondary">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Checkout Component ───────────────────────────────────────────────────
export default function Checkout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const currentUser = useAppSelector(selectCurrentUser)

  useGetCartQuery(undefined, { skip: !isAuthenticated })

  const [checkoutOrder, { isLoading: checkoutLoading }] = useCheckoutMutation()
  const [verifyPayment, { isLoading: verifyLoading }] = useVerifyPaymentMutation()
  const [clearCartRemote] = useClearCartRemoteMutation()

  const items = useAppSelector(selectCartItemsWithDetails)
  const subtotal = useAppSelector(selectCartSubtotal)
  const checkout = useAppSelector(selectCheckout)
  const appliedCoupon = useAppSelector(selectAppliedCoupon)
  const { shippingAddress, deliveryOption, paymentMethod } = checkout

  const [placingOrder, setPlacingOrder] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)

  // ── Totals (with coupon) ───────────────────────────────────────────────────
  const baseShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
  const selectedDelivery = deliveryOptions.find((o) => o.id === deliveryOption)
  const shipping = baseShipping + (selectedDelivery?.amount || 0)

  const discount = appliedCoupon?.discount_amount ?? 0
  const discountedSubtotal = Math.max(subtotal - discount, 0)
  const tax = Math.round(discountedSubtotal * TAX_RATE)
  const total = discountedSubtotal + shipping + tax

  const isProcessing = placingOrder || checkoutLoading || verifyLoading

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddressChange = (field, value) => {
    dispatch(updateShippingAddress({ [field]: value }))
  }

  const validateForm = () => {
    const required = ['fullName', 'phone', 'email', 'address', 'city', 'state', 'pincode']
    if (required.some((f) => !shippingAddress[f]?.trim())) {
      dispatch(showToast({ type: 'error', message: 'Please complete all shipping details' }))
      return false
    }
    if (!validatePhone(shippingAddress.phone)) {
      dispatch(showToast({ type: 'error', message: 'Please enter a valid phone number' }))
      return false
    }
    if (!validateEmail(shippingAddress.email)) {
      dispatch(showToast({ type: 'error', message: 'Please enter a valid email address' }))
      return false
    }
    return true
  }

  const checkoutPayload = () => ({
    shippingAddress,
    deliveryOption,
    paymentMethod,
    couponCode: appliedCoupon?.code || undefined,
  })

  // ── COD Flow ───────────────────────────────────────────────────────────────
  const handleCODCheckout = async () => {
    try {
      const order = await checkoutOrder({ ...checkoutPayload(), paymentMethod: 'cod' }).unwrap()
      dispatch(placeOrderSuccess())
      dispatch(showToast({ type: 'success', message: 'Order placed! Pay on delivery.' }))
      setCompletedOrder(order)
    } catch (err) {
      dispatch(placeOrderFailure())
      dispatch(showToast({ type: 'error', message: err.data?.message || 'Unable to place order' }))
    }
  }

  // ── Online (Razorpay) Flow ─────────────────────────────────────────────────
  const handleOnlineCheckout = async () => {
    let order
    try {
      order = await checkoutOrder({ ...checkoutPayload(), paymentMethod: 'online' }).unwrap()
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.data?.message || 'Unable to initiate payment' }))
      return
    }

    const razorpayOrderId = order.payment?.transactionId
    if (!razorpayOrderId) {
      dispatch(showToast({ type: 'error', message: 'Payment initialization failed' }))
      return
    }

    openRazorpayModal({
      razorpayOrderId,
      amount: order.total,
      orderRef: order.id,
      prefill: {
        name: shippingAddress.fullName,
        email: shippingAddress.email,
        contact: shippingAddress.phone,
      },
      description: 'SMI Battery Purchase',

      onSuccess: async (response) => {
        try {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }).unwrap()
          dispatch(placeOrderSuccess())
          dispatch(showToast({ type: 'success', message: 'Payment successful! Order confirmed.' }))
          setCompletedOrder({ ...order, payment: { ...order.payment, status: 'paid' } })
        } catch (err) {
          dispatch(showToast({ type: 'error', message: err.data?.message || 'Payment verification failed. Contact support.' }))
        } finally {
          setPlacingOrder(false)
        }
      },

      onFailure: (reason) => {
        dispatch(showToast({ type: 'error', message: `Payment failed: ${reason}` }))
        setPlacingOrder(false)
      },

      onDismiss: () => {
        dispatch(showToast({ type: 'error', message: 'Payment cancelled. Your order was not placed.' }))
        setPlacingOrder(false)
      },
    })
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      dispatch(showToast({ type: 'error', message: 'Please sign in to place an order' }))
      navigate('/login')
      return
    }

    if (!validateForm()) return
    if (items.length === 0) {
      dispatch(showToast({ type: 'error', message: 'Your cart is empty' }))
      return
    }

    setPlacingOrder(true)
    try {
      if (paymentMethod === 'cod') {
        await handleCODCheckout()
      } else {
        await handleOnlineCheckout()
        return
      }
    } finally {
      if (paymentMethod === 'cod') setPlacingOrder(false)
    }
  }

  // ── Early returns ──────────────────────────────────────────────────────────
  if (completedOrder) {
    return <OrderSuccess order={completedOrder} navigate={navigate} />
  }

  if (items.length === 0) {
    return (
      <div className="section-padding container-app text-center">
        <h1 className="text-3xl font-bold text-text">Checkout</h1>
        <p className="mt-4 text-muted">Your cart is empty.</p>
        <Link to="/products" className="btn-primary mt-8 inline-flex">
          Continue Shopping
        </Link>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="section-padding bg-primary">
      <div className="container-app">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-accent">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/cart" className="hover:text-accent">Cart</Link>
          <span className="mx-2">/</span>
          <span className="text-text">Checkout</span>
        </nav>

        <h1 className="mb-8 text-3xl font-bold text-text">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
          <div className="space-y-6 lg:col-span-2">

            {/* Shipping Address */}
            <section className="card" aria-labelledby="shipping-heading">
              <h2 id="shipping-heading" className="text-xl font-semibold text-text">
                Shipping Address
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ['fullName', 'Full Name', 'text'],
                  ['phone', 'Phone Number', 'tel'],
                  ['email', 'Email Address', 'email'],
                  ['city', 'City', 'text'],
                  ['state', 'State', 'text'],
                  ['pincode', 'PIN Code', 'text'],
                ].map(([field, label, type]) => (
                  <div key={field}>
                    <label htmlFor={field} className="label">{label}</label>
                    <input
                      id={field}
                      type={type}
                      value={shippingAddress[field]}
                      onChange={(e) => handleAddressChange(field, e.target.value)}
                      className="input-field"
                      autoComplete={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'off'}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="label">Street Address</label>
                  <textarea
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => handleAddressChange('address', e.target.value)}
                    className="input-field min-h-24 resize-y"
                    placeholder="House No., Street, Area..."
                  />
                </div>
              </div>
            </section>

            {/* Delivery Options */}
            <section className="card" aria-labelledby="delivery-heading">
              <h2 id="delivery-heading" className="text-xl font-semibold text-text">
                Delivery Options
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {deliveryOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      deliveryOption === option.id
                        ? 'border-accent bg-accent/10 shadow-sm shadow-accent/20'
                        : 'border-border bg-primary hover:border-accent/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={option.id}
                      checked={deliveryOption === option.id}
                      onChange={() => dispatch(setDeliveryOption(option.id))}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <span className="text-2xl" aria-hidden="true">{option.icon}</span>
                      <div className="flex-1">
                        <span className="block font-semibold text-text">{option.name}</span>
                        <span className="mt-0.5 block text-sm text-muted">{option.description}</span>
                        <span className="mt-2 block text-sm font-semibold text-accent">
                          {option.amount === 0 ? 'FREE' : `+${formatCurrency(option.amount)}`}
                        </span>
                      </div>
                      {deliveryOption === option.id && (
                        <svg className="h-5 w-5 shrink-0 text-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Payment Methods */}
            <section className="card" aria-labelledby="payment-heading">
              <h2 id="payment-heading" className="text-xl font-semibold text-text">
                Payment Method
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      paymentMethod === method.id
                        ? 'border-accent bg-accent/10 shadow-sm shadow-accent/20'
                        : 'border-border bg-primary hover:border-accent/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => dispatch(setPaymentMethod(method.id))}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <span className="text-2xl" aria-hidden="true">{method.icon}</span>
                      <div className="flex-1">
                        <span className="block font-semibold text-text">{method.name}</span>
                        <span className="mt-0.5 block text-sm text-muted">{method.description}</span>
                        {method.badge && (
                          <div className="mt-2"><RazorpayBadge /></div>
                        )}
                      </div>
                      {paymentMethod === method.id && (
                        <svg className="h-5 w-5 shrink-0 text-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === 'online' && (
                <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-muted">
                      <p className="font-medium text-text">Secure Payment via Razorpay</p>
                      <p className="mt-1">
                        You'll be redirected to the Razorpay payment portal. Supports UPI, Credit/Debit Cards, Net Banking, and Wallets. Your payment is encrypted and secure.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* ── RIGHT COLUMN ───────────────────────────────────────────── */}
          <aside className="space-y-6 lg:col-span-1">

            {/* Order Items */}
            <section className="card" aria-labelledby="order-heading">
              <h2 id="order-heading" className="text-xl font-semibold text-text">
                Order Summary
              </h2>
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.product.images?.[0]}
                      alt={item.product.name}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-text">
                        {item.product.name}
                      </p>
                      <p className="mt-1 text-xs text-muted">Qty {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-accent">
                      {formatCurrency(item.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Coupon Section ── */}
            <CouponSection subtotal={subtotal} />

            {/* Price Breakdown */}
            <section className="card space-y-4" aria-labelledby="price-heading">
              <h2 id="price-heading" className="text-xl font-semibold text-text">
                Price Breakdown
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-text">{formatCurrency(subtotal)}</span>
                </div>

                {/* Coupon discount line — shown when a coupon is applied */}
                {discount > 0 && (
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5 text-success">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Coupon ({appliedCoupon?.code})
                    </span>
                    <span className="text-success">−{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted">
                  <span>
                    Shipping
                    {deliveryOption === 'express' && <span className="ml-1 text-xs">(Express)</span>}
                  </span>
                  <span className="text-text">
                    {shipping === 0 ? (
                      <span className="font-semibold text-success">FREE</span>
                    ) : (
                      formatCurrency(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-muted">
                  <span>Tax (GST {TAX_RATE * 100}%)</span>
                  <span className="text-text">{formatCurrency(tax)}</span>
                </div>

                {/* Savings summary */}
                {discount > 0 && (
                  <div className="rounded-lg bg-success/5 px-3 py-2 text-xs text-success">
                    🎉 You're saving {formatCurrency(discount)} on this order!
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-base font-bold text-text">
                    <span>Total</span>
                    <div className="text-right">
                      {discount > 0 && (
                        <p className="text-xs font-normal text-muted line-through">
                          {formatCurrency(subtotal + shipping + Math.round(subtotal * TAX_RATE))}
                        </p>
                      )}
                      <span className="text-accent">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                id="place-order-btn"
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {paymentMethod === 'online' ? 'Initiating Payment...' : 'Placing Order...'}
                  </span>
                ) : paymentMethod === 'online' ? (
                  `Pay ${formatCurrency(total)}`
                ) : (
                  'Place Order (COD)'
                )}
              </button>

              <Link to="/cart" className="btn-secondary block w-full text-center">
                Back to Cart
              </Link>

              <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure &amp; Encrypted Checkout
              </p>
            </section>
          </aside>
        </form>
      </div>
    </div>
  )
}
