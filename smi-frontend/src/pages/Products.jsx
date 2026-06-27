import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '@/components/ProductCard/ProductCard'
import { ProductGridSkeleton } from '@/components/SkeletonLoader/SkeletonLoader'
import { useGetProductsQuery, useSearchProductsQuery } from '@/features/products/productApi'
import { useGetCategoriesQuery } from '@/features/categories/categoryApi'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  selectProductFilters,
  setProductFilters,
  setProductPage,
} from '@/features/products/productSlice'
import { useCartActions } from '@/hooks/useCartActions'
import { filterProducts, sortProducts } from '@/utils'
import { SORT_OPTIONS } from '@/constants'

export default function Products() {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useAppSelector(selectProductFilters)
  const { data: productsPage, isLoading, isFetching } = useGetProductsQuery(
    {
      page: filters.page,
      category: filters.category || undefined,
    },
    { skip: !!filters.search }
  )
  const {
    data: searchPage,
    isLoading: searchLoading,
    isFetching: searchFetching,
  } = useSearchProductsQuery(
    {
      page: filters.page,
      q: filters.search || undefined,
    },
    { skip: !filters.search }
  )
  const { data: categories = [] } = useGetCategoriesQuery()
  const { addToCart } = useCartActions()
  const pageData = filters.search ? searchPage : productsPage
  const products = pageData?.products || []

  useEffect(() => {
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    dispatch(setProductFilters({ category, search }))
  }, [searchParams, dispatch])

  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(products, { ...filters, search: '', category: '' })
    return sortProducts(filtered, filters.sortBy)
  }, [products, filters])

  const items = filteredProducts
  const totalPages = pageData?.totalPages || 1
  const totalItems = pageData?.totalProducts || filteredProducts.length

  const updateFilter = (key, value) => {
    dispatch(setProductFilters({ [key]: value }))

    if (key === 'category' || key === 'search') {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      setSearchParams(params)
    }
  }

  const handlePageChange = (page) => {
    dispatch(setProductPage(page))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="section-padding bg-primary">
      <div className="container-app">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text md:text-4xl">All Products</h1>
          <p className="mt-2 text-muted">
            {totalItems} products found
            {(isFetching || searchFetching) && !(isLoading || searchLoading) && ' - Updating...'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="space-y-6 lg:col-span-1" aria-label="Product filters">
            <div className="card space-y-4">
              <h2 className="font-semibold text-text">Filters</h2>

              <div>
                <label htmlFor="search" className="label">
                  Search
                </label>
                <input
                  id="search"
                  type="search"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search products..."
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label htmlFor="category" className="label">
                  Category
                </label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="minPrice" className="label">
                    Min Price
                  </label>
                  <input
                    id="minPrice"
                    type="number"
                    min="0"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    placeholder="Min"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="maxPrice" className="label">
                    Max Price
                  </label>
                  <input
                    id="maxPrice"
                    type="number"
                    min="0"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sortBy" className="label">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="input-field text-sm"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {isLoading || searchLoading ? (
              <ProductGridSkeleton />
            ) : items.length === 0 ? (
              <div className="card py-16 text-center">
                <p className="text-lg font-medium text-text">No products found</p>
                <p className="mt-2 text-muted">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav
                    className="mt-10 flex items-center justify-center gap-2"
                    aria-label="Pagination"
                  >
                    <button
                      type="button"
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className="btn-secondary px-4 py-2 text-sm"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => handlePageChange(page)}
                          aria-current={filters.page === page ? 'page' : undefined}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            filters.page === page
                              ? 'bg-accent text-black'
                              : 'border border-border text-muted hover:border-accent hover:text-accent'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}

                    <button
                      type="button"
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === totalPages}
                      className="btn-secondary px-4 py-2 text-sm"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
