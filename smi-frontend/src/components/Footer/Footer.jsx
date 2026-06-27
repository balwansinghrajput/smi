import { Link } from 'react-router-dom'
import { COMPANY, FOOTER_LINKS, SOCIAL_LINKS } from '@/constants'

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-border bg-secondary">
      <div className="container-app section-padding">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <span className="font-black text-black">SS</span>
              </div>
              <div>
                <p className="font-bold text-text">{COMPANY.name}</p>
                <p className="text-xs text-muted">Premium Batteries</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted">{COMPANY.description}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted transition-colors hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text">
              Company
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted transition-colors hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text">
              Contact Us
            </h3>
            <address className="space-y-2 not-italic text-sm text-muted">
              <p>{COMPANY.address}</p>
              <p>
                <a href={`tel:${COMPANY.phone}`} className="hover:text-accent">
                  {COMPANY.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${COMPANY.email}`} className="hover:text-accent">
                  {COMPANY.email}
                </a>
              </p>
              <p>{COMPANY.hours}</p>
            </address>

            <div className="mt-4 flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                  aria-label={social.name}
                >
                  <span className="text-xs font-bold">{social.icon[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
