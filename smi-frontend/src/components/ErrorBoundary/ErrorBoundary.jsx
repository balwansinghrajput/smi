import { Component } from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
          <h2 className="mb-2 text-2xl font-bold text-text">Something went wrong</h2>
          <p className="mb-6 max-w-md text-muted">
            We encountered an unexpected error. Please refresh the page or return home.
          </p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
