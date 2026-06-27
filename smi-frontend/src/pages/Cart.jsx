import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  selectCartItemsWithDetails,
  selectCartSubtotal,
  updateQuantity,
  removeFromCart,
} from '@/features/cart/cartSlice'
import { formatCurrency } from '@/utils'
import {
  TAX_RATE,
  SHIPPING_FLAT,
  FREE_SHIPPING_THRESHOLD,
} from '@/constants'

export default function Cart() {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectCartItemsWithDetails)
  const subtotal = useAppSelector(selectCartSubtotal)

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="section-padding container-app text-center">
        <h1 className="text-3xl font-bold text-text">Your Cart</h1>
        <p className="mt-4 text-muted">Your cart is empty</p>
        <Link to="/products" className="btn-primary mt-8 inline-flex">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="section-padding bg-primary">
      <div className="container-app">
        <h1 className="mb-8 text-3xl font-bold text-text">Your Cart</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="card flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                <Link to={`/products/${item.product.id}`} className="shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                </Link>

                <div className="flex-1">
                  <Link
                    to={`/products/${item.product.id}`}
                    className="font-semibold text-text hover:text-accent"
                  >
                    {item.product.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {item.product.capacity} · {item.product.voltage}
                  </p>
                  <p className="mt-1 font-medium text-accent">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            id: item.id,
                            quantity: item.quantity - 1,
                          })
                        )
                      }
                      disabled={item.quantity <= 1}
                      className="px-3 py-2 text-muted hover:text-accent disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            id: item.id,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      className="px-3 py-2 text-muted hover:text-accent"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <p className="hidden min-w-[5rem] text-right font-semibold text-text sm:block">
                    {formatCurrency(item.lineTotal)}
                  </p>

                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="text-muted transition-colors hover:text-error"
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="card h-fit space-y-4 lg:col-span-1" aria-label="Cart summary">
            <h2 className="text-lg font-semibold text-text">Order Summary</h2>

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
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-accent">
                  Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
                </p>
              )}
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

            <button type="button" className="btn-primary w-full">
              Proceed to Checkout
            </button>
            <Link to="/products" className="btn-secondary block w-full text-center">
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
