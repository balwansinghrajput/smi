import { memo } from 'react'
import { Link } from 'react-router-dom'

function CategoryCard({ category }) {
  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="card group overflow-hidden p-0"
      aria-label={`Browse ${category.name}, ${category.productCount} products`}
    >
      <div className="relative overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-lg font-bold text-text">{category.name}</h3>
          <p className="text-sm text-accent">{category.productCount} Products</p>
        </div>
      </div>
    </Link>
  )
}

export default memo(CategoryCard)
