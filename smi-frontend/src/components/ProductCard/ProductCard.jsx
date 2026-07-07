import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/utils'

function StarRating({ rating, reviewCount }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-accent' : 'text-border'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-muted">({rating}) &middot; {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
    </div>
  )
}

function ProductCard({ product, onAddToCart }) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault() // prevent link navigation if placed inside
    setIsAdding(true)
    await onAddToCart(product.id)
    setIsAdding(false)
  }
  return (
    <article className="card group relative flex h-full flex-col overflow-hidden p-0">
      <div className="relative block overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.isNew && (
          <span className="absolute left-3 top-3 z-10 rounded bg-accent px-2 py-0.5 text-xs font-bold text-black">
            NEW
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link
          to={`/products/${product.id}`}
          className="mb-2 line-clamp-2 font-semibold text-text transition-colors hover:text-accent after:absolute after:inset-0"
        >
          {product.name}
        </Link>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-accent">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-muted line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-muted">
          {product.capacity} · {product.voltage}
        </p>

        <div className="relative z-10 mt-auto pt-4">
          <span
            className={`mb-3 inline-block text-xs font-medium ${
              product.inStock ? 'text-success' : 'text-error'
            }`}
          >
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
            className="btn-primary w-full text-sm flex items-center justify-center gap-2"
            aria-label={`Add ${product.name} to cart`}
          >
            {isAdding ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding...
              </>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>
    </article>
  )
}

export default memo(ProductCard)
