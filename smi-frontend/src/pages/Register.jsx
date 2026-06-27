import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '@/features/auth/authApi'
import { useAppDispatch } from '@/hooks/redux'
import { showToast } from '@/features/ui/uiSlice'
import { validateEmail, validatePhone, validatePassword } from '@/utils'

export default function Register() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [register, { isLoading }] = useRegisterMutation()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(form.phone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(form.password)) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await register(form).unwrap()
      dispatch(showToast({ type: 'success', message: 'Account created successfully!' }))
      navigate('/')
    } catch (err) {
      dispatch(
        showToast({
          type: 'error',
          message: err.data?.message || 'Registration failed',
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

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <h1 className="mb-2 text-2xl font-bold text-text">Create Account</h1>
        <p className="mb-8 text-sm text-muted">Join Shri Shyam Enterprises</p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="name" className="label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'border-error' : ''}`}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

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
            />
            {errors.email && (
              <p className="mt-1 text-xs text-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="label">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              className={`input-field ${errors.phone ? 'border-error' : ''}`}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-error" role="alert">
                {errors.phone}
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
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className={`input-field ${errors.password ? 'border-error' : ''}`}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
