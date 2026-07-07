import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProductCard from '@/components/ProductCard/ProductCard'
import { ProductGridSkeleton } from '@/components/SkeletonLoader/SkeletonLoader'
import SkeletonLoader from '@/components/SkeletonLoader/SkeletonLoader'
import { useGetProductByIdQuery, useGetRelatedProductsQuery } from '@/features/products/productApi'
import { useAddReviewMutation, useGetProductReviewsQuery } from '@/features/reviews/reviewsApi'
import { selectIsAuthenticated } from '@/features/auth/authSlice'
import { showToast } from '@/features/ui/uiSlice'
import { useCartActions } from '@/hooks/useCartActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { formatCurrency, calculateDiscount } from '@/utils'
import { COMPANY } from '@/constants'

function StarRating({ rating, size = 'h-5 w-5' }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`${size} ${i < Math.floor(rating) ? 'text-accent' : 'text-border'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ProductDetails() {
  const { id } = useParams()
  const productId = id?.trim()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { addToCart } = useCartActions()
  const { data: product, isLoading, isError } = useGetProductByIdQuery(productId, {
    skip: !productId,
    refetchOnMountOrArgChange: true,
  })
  const { data: relatedProducts = [] } = useGetRelatedProductsQuery(productId, {
    skip: !productId,
    refetchOnMountOrArgChange: true,
  })
  const { data: reviewsData } = useGetProductReviewsQuery(productId, {
    skip: !productId,
    refetchOnMountOrArgChange: true,
  })
  const [addReview, { isLoading: submittingReview }] = useAddReviewMutation()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const reviews = reviewsData?.reviews || []
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  })

  const similarProducts = useMemo(() => (relatedProducts || []).slice(0, 4), [relatedProducts])

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    await addToCart(product.id, quantity)
    setIsAddingToCart(false)
  }

  const handleBuyNow = async () => {
    if (product?.inStock) {
      setIsBuyingNow(true)
      const success = await addToCart(product.id, quantity)
      setIsBuyingNow(false)
      if (success) {
        navigate('/checkout')
      }
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      dispatch(showToast({ type: 'error', message: 'Please sign in to submit a review' }))
      return
    }

    if (!reviewForm.comment.trim()) {
      dispatch(showToast({ type: 'error', message: 'Please complete the review form' }))
      return
    }

    try {
      await addReview({
        productId: product.id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      }).unwrap()
      dispatch(showToast({ type: 'success', message: 'Review submitted' }))
      setReviewForm({ rating: 5, comment: '' })
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.data?.message || 'Unable to submit review' }))
    }
  }

  if (isLoading) {
    return (
      <div className="section-padding container-app">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <SkeletonLoader className="aspect-square w-full" />
          <div className="space-y-4">
            <SkeletonLoader variant="text" className="h-8 w-3/4" />
            <SkeletonLoader variant="text" className="w-1/2" />
            <SkeletonLoader className="h-32 w-full" />
          </div>
        </div>
        <div className="mt-16">
          <ProductGridSkeleton count={4} />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="section-padding container-app text-center">
        <h1 className="text-2xl font-bold text-text">Product not found</h1>
        <Link to="/products" className="btn-primary mt-6 inline-flex">
          Back to Products
        </Link>
      </div>
    )
  }

  const discount = calculateDiscount(product.price, product.originalPrice)
  const stockLimit = Math.max(1, product.stockCount || 1)

  return (
    <div className="section-padding bg-primary">
      <div className="container-app">
        <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-accent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-accent">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border bg-secondary">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3 sm:flex" role="list" aria-label="Product images">
              {product.images.map((img, index) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImage === index ? 'border-accent' : 'border-border'
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-current={selectedImage === index}
                >
                  <img src={img} alt="" className="aspect-square w-full object-cover sm:h-20 sm:w-20" />
                </button>
              ))}
            </div>
          </div>

          <section aria-labelledby="product-title">
            <div className="flex flex-wrap items-center gap-2">
              {product.isNew && (
                <span className="rounded bg-accent px-2 py-0.5 text-xs font-bold text-black">
                  NEW
                </span>
              )}
              {product.isBestSelling && (
                <span className="rounded border border-accent/40 px-2 py-0.5 text-xs font-medium text-accent">
                  Best Selling
                </span>
              )}
            </div>

            <h1 id="product-title" className="mt-3 text-3xl font-bold text-text md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StarRating rating={product.rating} />
              <span className="text-sm text-muted">
                {product.rating} ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-accent">
                {formatCurrency(product.price)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-muted line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <span className="rounded bg-success/20 px-2 py-0.5 text-sm font-medium text-success">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <p
              className={`mt-4 text-sm font-medium ${
                product.inStock ? 'text-success' : 'text-error'
              }`}
            >
              {product.inStock
                ? `In Stock (${product.stockCount} available)`
                : 'Out of Stock'}
            </p>

            <p className="mt-4 leading-relaxed text-muted">{product.description}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: 'Capacity', value: product.capacity },
                { label: 'Voltage', value: product.voltage },
                { label: 'Warranty', value: product.warranty },
              ].map((spec) => (
                <div key={spec.label} className="card text-center">
                  <p className="text-xs text-muted">{spec.label}</p>
                  <p className="mt-1 font-semibold text-text">{spec.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div>
                <label htmlFor="quantity" className="label">
                  Quantity
                </label>
                <div className="flex w-full items-center rounded-lg border border-border sm:w-36">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-3 text-muted hover:text-accent disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={stockLimit}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.min(stockLimit, Math.max(1, Number(e.target.value) || 1)))
                    }
                    className="w-full bg-transparent text-center text-sm font-semibold text-text focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.min(stockLimit, value + 1))}
                    disabled={quantity >= stockLimit}
                    className="px-4 py-3 text-muted hover:text-accent disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart || isBuyingNow}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isAddingToCart ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!product.inStock || isAddingToCart || isBuyingNow}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  {isBuyingNow ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Buy Now'
                  )}
                </button>
              </div>
            </div>

            <a
              href={`tel:${COMPANY.phone}`}
              className="btn-ghost mt-4 w-full border border-border text-center sm:w-auto"
            >
              Contact Dealer
            </a>
          </section>
        </div>

        <section className="mt-16" aria-labelledby="specs-heading">
          <h2 id="specs-heading" className="mb-6 text-2xl font-bold text-text">
            Specifications
          </h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <tr key={key} className="border-b border-border last:border-0">
                    <td className="px-4 py-4 capitalize text-muted sm:px-6">{key}</td>
                    <td className="px-4 py-4 font-medium text-text sm:px-6">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="reviews-heading">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="reviews-heading" className="text-2xl font-bold text-text">
                Product Reviews
              </h2>
              <p className="mt-1 text-sm text-muted">
                See what customers are saying and share your experience.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <StarRating rating={product.rating} size="h-4 w-4" />
              <span>{reviews.length || 'No'} submitted reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <article key={review.id} className="card">
                    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-semibold text-text">{review.author}</span>
                      <span className="text-xs text-muted">{review.date}</span>
                    </div>
                    <StarRating rating={review.rating} size="h-4 w-4" />
                    <p className="mt-3 text-sm leading-relaxed text-muted">{review.comment}</p>
                  </article>
                ))
              ) : (
                <div className="card text-sm text-muted">
                  No reviews yet. Be the first to review this product.
                </div>
              )}
            </div>

            <form onSubmit={handleReviewSubmit} className="card h-fit space-y-4">
              <h3 className="text-lg font-semibold text-text">Write a Review</h3>
              <div>
                <label htmlFor="review-rating" className="label">
                  Rating
                </label>
                <select
                  id="review-rating"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                  className="input-field"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} stars
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="review-comment" className="label">
                  Review
                </label>
                <textarea
                  id="review-comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="input-field min-h-28 resize-y"
                  placeholder="How did this battery perform?"
                />
              </div>
              <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </section>

        {similarProducts.length > 0 && (
          <section className="mt-16" aria-labelledby="similar-heading">
            <h2 id="similar-heading" className="mb-6 text-2xl font-bold text-text">
              Related Products
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
