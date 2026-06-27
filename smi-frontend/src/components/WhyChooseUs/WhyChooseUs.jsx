import { Link } from 'react-router-dom'
import { WHY_CHOOSE_US } from '@/constants'

const icons = {
  battery: 'M13 10V3L4 14h7v7l9-11h-7z',
  bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  factory: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  network: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
}

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="section-padding bg-primary" aria-labelledby="why-us-heading">
      <div className="container-app">
        <div className="mb-12 text-center">
          <h2 id="why-us-heading" className="mb-3 text-3xl font-bold text-text md:text-4xl">
            Why Choose Us
          </h2>
          <p className="mx-auto max-w-2xl text-muted">
            Trusted by bike owners, dealers, and retail shops across India for quality and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {WHY_CHOOSE_US.map((item) => (
            <div key={item.id} className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <svg
                  className="h-7 w-7 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d={icons[item.icon] || icons.battery}
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-text">{item.title}</h3>
              <p className="text-sm text-muted">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/products" className="btn-primary">
            Explore Products
          </Link>
        </div>
      </div>
    </section>
  )
}
