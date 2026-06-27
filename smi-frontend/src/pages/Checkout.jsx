import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  selectCartItemsWithDetails,
  selectCartSubtotal,
} from '@/features/cart/cartSlice'
import { useClearCartRemoteMutation, useGetCartQuery } from '@/features/cart/cartApi'
import {
  selectCheckout,
  setDeliveryOption,
  setPaymentMethod,
  placeOrderFailure,
  placeOrderSuccess,
  updateShippingAddress,
} from '@/features/checkout/checkoutSlice'
import { useCheckoutMutation } from '@/features/checkout/checkoutApi'
import { selectIsAuthenticated } from '@/features/auth/authSlice'
import { showToast } from '@/features/ui/uiSlice'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT, TAX_RATE } from '@/constants'
import { formatCurrency, validateEmail, validatePhone } from '@/utils'

const deliveryOptions = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Delivery in 3-5 business days',
    amount: 0,
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Priority delivery in 1-2 business days',
    amount: 149,
  },
]

const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay when your order arrives' },
  { id: 'upi', name: 'UPI', description: 'PhonePe, Google Pay, Paytm and more' },
  { id: 'card', name: 'Card', description: 'Credit or debit card payment UI' },
]

export default function Checkout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  useGetCartQuery(undefined, { skip: !isAuthenticated })
  const [checkoutOrder, { isLoading: checkoutLoading }] = useCheckoutMutation()
  const [clearCartRemote] = useClearCartRemoteMutation()
  const items = useAppSelector(selectCartItemsWithDetails)
  const subtotal = useAppSelector(selectCartSubtotal)
  const checkout = useAppSelector(selectCheckout)
  const { shippingAddress, deliveryOption, paymentMethod, placingOrder, orderPlaced } =
    checkout

  const baseShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
  const selectedDelivery = deliveryOptions.find((option) => option.id === deliveryOption)
  const shipping = baseShipping + (selectedDelivery?.amount || 0)
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + shipping + tax

  const handleAddressChange = (field, value) => {
    dispatch(updateShippingAddress({ [field]: value }))
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      dispatch(showToast({ type: 'error', message: 'Please sign in to place an order' }))
      navigate('/login')
      return
    }

    const requiredFields = ['fullName', 'phone', 'email', 'address', 'city', 'state', 'pincode']
    const hasMissingField = requiredFields.some((field) => !shippingAddress[field].trim())

    if (hasMissingField) {
      dispatch(showToast({ type: 'error', message: 'Please complete shipping details' }))
      return
    }

    if (!validatePhone(shippingAddress.phone) || !validateEmail(shippingAddress.email)) {
      dispatch(showToast({ type: 'error', message: 'Enter valid contact details' }))
      return
    }

    try {
      const order = await checkoutOrder({
        shippingAddress,
        deliveryOption,
        paymentMethod,
      }).unwrap()
      await clearCartRemote().unwrap()
      dispatch(placeOrderSuccess())
      dispatch(showToast({ type: 'success', message: 'Order placed successfully' }))
      if (order.payment?.paymentUrl && paymentMethod !== 'cod') {
        dispatch(showToast({ type: 'success', message: 'Online payment initialized' }))
      }
    } catch (err) {
      dispatch(placeOrderFailure())
      dispatch(showToast({ type: 'error', message: err.data?.message || 'Unable to place order' }))
    }
  }

  if (items.length === 0 && !orderPlaced) {
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

  if (orderPlaced) {
    return (
      <div className="section-padding container-app text-center">
        <div className="mx-auto max-w-xl rounded-xl border border-border bg-secondary p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/20 text-success">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-5 text-3xl font-bold text-text">Order Placed</h1>
          <p className="mt-3 text-muted">
            Your order has been created successfully.
          </p>
          <button type="button" onClick={() => navigate('/products')} className="btn-primary mt-8">
            Shop More Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="section-padding bg-primary">
      <div className="container-app">
        <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-accent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/cart" className="hover:text-accent">
            Cart
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text">Checkout</span>
        </nav>

        <h1 className="mb-8 text-3xl font-bold text-text">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
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
                    <label htmlFor={field} className="label">
                      {label}
                    </label>
                    <input
                      id={field}
                      type={type}
                      value={shippingAddress[field]}
                      onChange={(e) => handleAddressChange(field, e.target.value)}
                      className="input-field"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="label">
                    Street Address
                  </label>
                  <textarea
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => handleAddressChange('address', e.target.value)}
                    className="input-field min-h-24 resize-y"
                  />
                </div>
              </div>
            </section>

            <section className="card" aria-labelledby="delivery-heading">
              <h2 id="delivery-heading" className="text-xl font-semibold text-text">
                Delivery Options
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {deliveryOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      deliveryOption === option.id
                        ? 'border-accent bg-accent/10'
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
                    <span className="block font-semibold text-text">{option.name}</span>
                    <span className="mt-1 block text-sm text-muted">{option.description}</span>
                    <span className="mt-3 block text-sm font-semibold text-accent">
                      {option.amount === 0 ? 'Included' : formatCurrency(option.amount)}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="card" aria-labelledby="payment-heading">
              <h2 id="payment-heading" className="text-xl font-semibold text-text">
                Payment Method
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      paymentMethod === method.id
                        ? 'border-accent bg-accent/10'
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
                    <span className="block font-semibold text-text">{method.name}</span>
                    <span className="mt-1 block text-sm text-muted">{method.description}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:col-span-1">
            <section className="card" aria-labelledby="order-heading">
              <h2 id="order-heading" className="text-xl font-semibold text-text">
                Order Summary
              </h2>
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-text">
                        {item.product.name}
                      </p>
                      <p className="mt-1 text-xs text-muted">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-accent">
                      {formatCurrency(item.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="card space-y-4" aria-labelledby="price-heading">
              <h2 id="price-heading" className="text-xl font-semibold text-text">
                Price Breakdown
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-text">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span className="text-text">
                    {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Tax (GST {TAX_RATE * 100}%)</span>
                  <span className="text-text">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-base font-bold text-text">
                    <span>Total</span>
                    <span className="text-accent">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={placingOrder || checkoutLoading} className="btn-primary w-full">
                {placingOrder || checkoutLoading ? 'Placing Order...' : 'Place Order'}
              </button>
              <Link to="/cart" className="btn-secondary block w-full text-center">
                Back to Cart
              </Link>
            </section>
          </aside>
        </form>
      </div>
    </div>
  )
}
