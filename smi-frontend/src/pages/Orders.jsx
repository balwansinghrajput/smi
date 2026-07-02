import { Link, useNavigate } from 'react-router-dom'
import { useGetOrdersQuery } from '@/features/checkout/checkoutApi'
import { selectIsAuthenticated } from '@/features/auth/authSlice'
import { useAppSelector } from '@/hooks/redux'
import { formatCurrency } from '@/utils'

// ─── Status badge config ────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    icon: '🕐',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: '✅',
  },
  processing: {
    label: 'Processing',
    className: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    icon: '⚙️',
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    icon: '🚚',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-green-500/15 text-green-400 border-green-500/30',
    icon: '📦',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: '❌',
  },
}

const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Pending', className: 'text-yellow-400' },
  paid: { label: 'Paid', className: 'text-green-400' },
  created: { label: 'Awaiting Payment', className: 'text-blue-400' },
  failed: { label: 'Failed', className: 'text-red-400' },
  initializing: { label: 'Initializing', className: 'text-muted' },
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-border text-muted border-border',
    icon: '•',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  )
}

function PaymentBadge({ payment }) {
  const methodLabel =
    payment?.method === 'cod'
      ? 'Cash on Delivery'
      : payment?.provider === 'razorpay'
      ? 'Razorpay'
      : payment?.method || 'Online'

  const statusConfig = PAYMENT_STATUS_CONFIG[payment?.status] || {
    label: payment?.status,
    className: 'text-muted',
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted">{methodLabel}</span>
      <span className={`font-medium ${statusConfig.className}`}>· {statusConfig.label}</span>
    </div>
  )
}

// ─── Order skeleton loader ──────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="card animate-pulse space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-border/60" />
          <div className="h-3 w-24 rounded bg-border/40" />
        </div>
        <div className="h-6 w-20 rounded-full bg-border/60" />
      </div>
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 w-14 rounded-lg bg-border/40" />
        ))}
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-24 rounded bg-border/40" />
        <div className="h-5 w-20 rounded bg-border/60" />
      </div>
    </div>
  )
}

// ─── Single Order Card ──────────────────────────────────────────────────────
function OrderCard({ order }) {
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const previewItems = order.items.slice(0, 4)
  const extraCount = order.items.length - previewItems.length

  return (
    <article className="card group space-y-4 transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-black/20">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">
            Order ID: <span className="text-accent">{order.id}</span>
          </p>
          <p className="mt-1 text-sm text-muted">{date}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Product thumbnails */}
      <div className="flex gap-2">
        {previewItems.map((item) => (
          <div
            key={item.id}
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border"
          >
            <img
              src={item.product?.images?.[0]}
              alt={item.product?.name}
              className="h-full w-full object-cover"
            />
            {item.quantity > 1 && (
              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[10px] font-bold text-white">
                ×{item.quantity}
              </span>
            )}
          </div>
        ))}
        {extraCount > 0 && (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-sm font-semibold text-muted">
            +{extraCount}
          </div>
        )}
      </div>

      {/* Item names */}
      <div className="text-sm text-muted">
        {order.items
          .slice(0, 2)
          .map((i) => i.product?.name)
          .filter(Boolean)
          .join(', ')}
        {order.items.length > 2 && ` +${order.items.length - 2} more`}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="space-y-1">
          <PaymentBadge payment={order.payment} />
          <p className="text-xs text-muted">
            {order.deliveryOption === 'express' ? '⚡ Express' : '📦 Standard'} ·{' '}
            {order.totalQuantity} item{order.totalQuantity !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Total</p>
          <p className="text-lg font-bold text-accent">{formatCurrency(order.total)}</p>
        </div>
      </div>

      {/* Shipping address preview */}
      <div className="rounded-lg bg-secondary px-4 py-3 text-xs text-muted">
        <span className="font-medium text-text">Delivering to: </span>
        {order.shippingAddress?.fullName} · {order.shippingAddress?.city},{' '}
        {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
      </div>
    </article>
  )
}

// ─── Main Orders Page ───────────────────────────────────────────────────────
export default function Orders() {
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const { data: orders = [], isLoading, isError } = useGetOrdersQuery(undefined, {
    skip: !isAuthenticated,
  })

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="section-padding container-app text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-4xl">
            🔒
          </div>
          <h1 className="mt-6 text-2xl font-bold text-text">Sign In Required</h1>
          <p className="mt-3 text-muted">Please sign in to view your order history.</p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-primary mt-6"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="section-padding bg-primary">
      <div className="container-app">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text md:text-4xl">My Orders</h1>
            <p className="mt-2 text-muted">
              {isLoading
                ? 'Loading your orders...'
                : `${orders.length} order${orders.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <Link to="/products" className="btn-secondary self-start text-sm">
            Shop More
          </Link>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="card py-16 text-center">
            <p className="text-lg font-medium text-text">Unable to load orders</p>
            <p className="mt-2 text-sm text-muted">
              Please check your connection and try again.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && orders.length === 0 && (
          <div className="card mx-auto max-w-md py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-4xl">
              📭
            </div>
            <h2 className="mt-6 text-xl font-semibold text-text">No orders yet</h2>
            <p className="mt-2 text-muted">
              Start shopping to see your orders here.
            </p>
            <Link to="/products" className="btn-primary mt-6 inline-flex">
              Browse Products
            </Link>
          </div>
        )}

        {/* Orders grid */}
        {!isLoading && !isError && orders.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
