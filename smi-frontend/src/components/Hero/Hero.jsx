import { Link } from 'react-router-dom'
import { COMPANY } from '@/constants'
import heroImage from '../../../assets/images/Gemini_Generated_Image_l47jmll47jmll47j.webp'
import heroVideo from '../../../assets/videos/Shri_Shyam_Enterprises_bike_batt_202606151356.mp4'
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary" aria-label="Hero banner">
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={heroImage}
          className="h-full w-full object-cover opacity-40"
          aria-hidden="true"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/60" />
      </div>

      <div className="container-app relative z-10 flex min-h-[85vh] flex-col justify-center py-16 md:min-h-[90vh]">
        <div className="max-w-2xl">
          <span className="mb-4 inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
            Premium Battery Manufacturer
          </span>

          <h1 className="mb-4 text-4xl font-bold leading-tight text-text sm:text-5xl lg:text-6xl">
            {COMPANY.name}
          </h1>

          <p className="mb-2 text-xl font-medium text-accent">{COMPANY.tagline}</p>

          <p className="mb-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {COMPANY.description}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link to="/products" className="btn-primary">
              Shop Now
            </Link>
            <a href="#contact" className="btn-secondary">
              Contact Us
            </a>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:max-w-3xl">
          {[
            { label: 'Products', value: '40+' },
            { label: 'Dealers', value: '500+' },
            { label: 'Warranty', value: '36 Mo' },
            { label: 'Rating', value: '4.8★' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border/50 bg-primary/50 p-4 text-center backdrop-blur-sm"
            >
              <p className="text-2xl font-bold text-accent">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
