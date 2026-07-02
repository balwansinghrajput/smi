import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectCartItemCount } from '@/features/cart/cartSlice'
import { selectIsAuthenticated, selectCurrentUser, logout } from '@/features/auth/authSlice'
import { closeMobileMenu, selectMobileMenuOpen, toggleMobileMenu } from '@/features/ui/uiSlice'
import { COMPANY } from '@/constants'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
]

export default function Navbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const cartCount = useAppSelector(selectCartItemCount)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectCurrentUser)
  const mobileMenuOpen = useAppSelector(selectMobileMenuOpen)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      dispatch(closeMobileMenu())
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    dispatch(closeMobileMenu())
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-accent ${
      isActive ? 'text-accent' : 'text-muted'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-primary/95 backdrop-blur-md">
      <nav className="container-app" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2"
            aria-label={`${COMPANY.name} home`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-black text-black">SS</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight text-text">Shri Shyam</p>
              <p className="text-xs text-muted">Enterprises</p>
            </div>
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink to="/orders" className={linkClass}>
                My Orders
              </NavLink>
            )}
          </div>

          <form
            onSubmit={handleSearch}
            className="hidden max-w-xs flex-1 md:block lg:max-w-sm"
            role="search"
          >
            <label htmlFor="nav-search" className="sr-only">
              Search products
            </label>
            <input
              id="nav-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search batteries..."
              className="input-field py-2 text-sm"
            />
          </form>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart icon */}
            <Link
              to="/cart"
              className="relative rounded-lg p-2 text-muted transition-colors hover:bg-secondary hover:text-accent"
              aria-label={`Cart, ${cartCount} items`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-black">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/orders"
                  className="text-sm text-muted transition-colors hover:text-accent"
                  aria-label="My orders"
                >
                  Hi, {user?.name?.split(' ')[0]}
                </Link>
                <button type="button" onClick={handleLogout} className="btn-ghost text-sm">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-ghost hidden text-sm sm:inline-flex">
                Login
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => dispatch(toggleMobileMenu())}
              className="rounded-lg p-2 text-muted hover:bg-secondary lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 lg:hidden">
            <form onSubmit={handleSearch} className="mb-4 md:hidden" role="search">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batteries..."
                className="input-field text-sm"
                aria-label="Search products"
              />
            </form>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={linkClass}
                  onClick={() => dispatch(closeMobileMenu())}
                >
                  {link.label}
                </NavLink>
              ))}
              {isAuthenticated && (
                <NavLink
                  to="/orders"
                  className={linkClass}
                  onClick={() => dispatch(closeMobileMenu())}
                >
                  My Orders
                </NavLink>
              )}
              {isAuthenticated ? (
                <button type="button" onClick={handleLogout} className="btn-ghost justify-start">
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn-ghost justify-start"
                  onClick={() => dispatch(closeMobileMenu())}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
