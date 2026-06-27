import { Link } from 'react-router-dom'
import Hero from '@/components/Hero/Hero'
import CategoryCard from '@/components/CategoryCard/CategoryCard'
import ProductCard from '@/components/ProductCard/ProductCard'
import WhyChooseUs from '@/components/WhyChooseUs/WhyChooseUs'
import Testimonials from '@/components/Testimonials/Testimonials'
import { ProductGridSkeleton } from '@/components/SkeletonLoader/SkeletonLoader'
import { useGetCategoriesQuery } from '@/features/categories/categoryApi'
import { useGetProductsQuery } from '@/features/products/productApi'
import { useCartActions } from '@/hooks/useCartActions'

export default function Home() {
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery()
  const { data: featuredProducts = [], isLoading: productsLoading } = useGetProductsQuery({
    featured: true,
  })
  const { addToCart } = useCartActions()

  return (
    <>
      <Hero />

      <section className="section-padding bg-primary" aria-labelledby="categories-heading">
        <div className="container-app">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 id="categories-heading" className="text-3xl font-bold text-text md:text-4xl">
                Featured Categories
              </h2>
              <p className="mt-2 text-muted">Browse batteries by category</p>
            </div>
            <Link to="/products" className="btn-secondary text-sm">
              View All
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card aspect-[4/3] animate-pulse bg-border/40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-secondary" aria-labelledby="featured-heading">
        <div className="container-app">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 id="featured-heading" className="text-3xl font-bold text-text md:text-4xl">
                Featured Products
              </h2>
              <p className="mt-2 text-muted">Top-rated batteries from our collection</p>
            </div>
            <Link to="/products" className="btn-secondary text-sm">
              Shop All
            </Link>
          </div>

          {productsLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <WhyChooseUs />
      <Testimonials />
    </>
  )
}
