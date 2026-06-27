import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProductCard from '@/components/ProductCard/ProductCard'
import { ProductGridSkeleton } from '@/components/SkeletonLoader/SkeletonLoader'
import SkeletonLoader from '@/components/SkeletonLoader/SkeletonLoader'
import { useGetProductByIdQuery, useGetProductsQuery } from '@/features/products/productApi'
import { useCartActions } from '@/hooks/useCartActions'
import { formatCurrency, calculateDiscount } from '@/utils'
import { COMPANY } from '@/constants'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCartActions()
  const { data: product, isLoading, isError } = useGetProductByIdQuery(id)
  const { data: allProducts = [] } = useGetProductsQuery()
  const [selectedImage, setSelectedImage] = useState(0)

  const similarProducts = allProducts
    .filter((p) => p.categoryId === product?.categoryId && p.id !== product?.id)
    .slice(0, 4)

  const handleBuyNow = () => {
    if (product?.inStock) {
      addToCart(product.id)
      navigate('/cart')
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

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-xl border border-border bg-secondary">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3" role="list" aria-label="Product images">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImage === index ? 'border-accent' : 'border-border'
                    }`}
                    aria-label={`View image ${index + 1}`}
                    aria-current={selectedImage === index}
                  >
                    <img src={img} alt="" className="h-16 w-16 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-text">{product.name}</h1>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex gap-1" aria-label={`Rating ${product.rating}`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-accent' : 'text-border'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
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

            <div className="mt-6 grid grid-cols-3 gap-4">
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => addToCart(product.id)}
                disabled={!product.inStock}
                className="btn-primary flex-1"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="btn-secondary flex-1"
              >
                Buy Now
              </button>
              <a
                href={`tel:${COMPANY.phone}`}
                className="btn-ghost flex-1 border border-border text-center"
              >
                Contact Dealer
              </a>
            </div>
          </div>
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
                    <td className="px-6 py-4 capitalize text-muted">{key}</td>
                    <td className="px-6 py-4 font-medium text-text">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {product.reviews?.length > 0 && (
          <section className="mt-16" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="mb-6 text-2xl font-bold text-text">
              Customer Reviews
            </h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <article key={review.id} className="card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-text">{review.author}</span>
                    <span className="text-xs text-muted">{review.date}</span>
                  </div>
                  <div className="mb-2 flex gap-1" aria-label={`${review.rating} stars`}>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-muted">{review.comment}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {similarProducts.length > 0 && (
          <section className="mt-16" aria-labelledby="similar-heading">
            <h2 id="similar-heading" className="mb-6 text-2xl font-bold text-text">
              Similar Products
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
