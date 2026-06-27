export default function SkeletonLoader({ className = '', variant = 'rect' }) {
  const base = 'animate-pulse bg-border/60'

  if (variant === 'circle') {
    return <div className={`${base} rounded-full ${className}`} aria-hidden="true" />
  }

  if (variant === 'text') {
    return <div className={`${base} h-4 rounded ${className}`} aria-hidden="true" />
  }

  return <div className={`${base} rounded-lg ${className}`} aria-hidden="true" />
}

export function ProductCardSkeleton() {
  return (
    <div className="card space-y-4" aria-hidden="true">
      <SkeletonLoader className="aspect-square w-full" />
      <SkeletonLoader variant="text" className="w-3/4" />
      <SkeletonLoader variant="text" className="w-1/2" />
      <SkeletonLoader className="h-10 w-full" />
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
