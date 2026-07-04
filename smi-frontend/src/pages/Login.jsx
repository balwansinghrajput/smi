import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useLoginMutation, useLoginWithGoogleMutation } from '@/features/auth/authApi'
import { useAppDispatch } from '@/hooks/redux'
import { showToast } from '@/features/ui/uiSlice'
import { validateEmail } from '@/utils'

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()
  const [loginWithGoogle] = useLoginWithGoogleMutation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})


  const validate = () => {
    const newErrors = {}

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await login(form).unwrap()
      dispatch(showToast({ type: 'success', message: 'Welcome back!' }))
      navigate('/')
    } catch (err) {
      dispatch(
        showToast({
          type: 'error',
          message: err.data?.message || 'Login failed',
        })
      )
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle({ token: credentialResponse.credential }).unwrap()
      dispatch(showToast({ type: 'success', message: 'Welcome back!' }))
      navigate('/')
    } catch (err) {
      dispatch(
        showToast({
          type: 'error',
          message: err.data?.message || 'Google Sign In failed',
        })
      )
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <h1 className="mb-2 text-2xl font-bold text-text">Welcome Back</h1>
        <p className="mb-8 text-sm text-muted">Sign in to your account</p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'border-error' : ''}`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className={`input-field ${errors.password ? 'border-error' : ''}`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface px-2 text-muted">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => dispatch(showToast({ type: 'error', message: 'Google Sign In failed' }))}
            />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">

            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
