import { useGetFeaturedReviewsQuery } from '@/features/reviews/reviewsApi'

export default function Testimonials() {
  const { data: testimonials = [], isLoading } = useGetFeaturedReviewsQuery()

  if (isLoading) {
    return (
      <section className="section-padding bg-secondary" aria-labelledby="testimonials-heading">
        <div className="container-app">
          <div className="mb-12 text-center">
            <h2 id="testimonials-heading" className="mb-3 text-3xl font-bold text-text md:text-4xl">
              Customer Reviews
            </h2>
            <p className="text-muted">What our customers and dealers say about us</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card aspect-square animate-pulse bg-border/40" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="section-padding bg-secondary" aria-labelledby="testimonials-heading">
      <div className="container-app">
        <div className="mb-12 text-center">
          <h2 id="testimonials-heading" className="mb-3 text-3xl font-bold text-text md:text-4xl">
            Customer Reviews
          </h2>
          <p className="text-muted">What our customers and dealers say about us</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((item) => (
            <blockquote key={item.id} className="card flex flex-col">
              <div className="mb-4 flex gap-1" aria-label={`${item.rating} star rating`}>
                {Array.from({ length: item.rating }).map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted">
                &ldquo;{item.comment}&rdquo;
              </p>
              <footer className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-black"
                  aria-hidden="true"
                >
                  {item.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <cite className="not-italic font-semibold text-text">{item.author}</cite>
                  <p className="text-xs text-muted">{item.date}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
