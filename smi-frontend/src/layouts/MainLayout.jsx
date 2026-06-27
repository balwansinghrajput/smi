import { Link } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'
import Toast from '@/components/Toast/Toast'
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <Toast />
    </div>
  )
}

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <header className="border-b border-border py-4">
        <div className="container-app">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-black text-black">SS</span>
            </div>
            <span className="font-bold text-text">Shri Shyam Enterprises</span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Toast />
    </div>
  )
}
