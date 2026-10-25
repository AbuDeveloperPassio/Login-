import { useState } from 'react'
import { login, signup } from '../api'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Auth({ mode, onSwitch, onAuth }) {
  const isSignup = mode === 'signup'

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  function validate() {
    if (isSignup && form.name.trim().length < 2) {
      return 'Name must be at least 2 characters'
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      return 'Enter a valid email address'
    }
    if (form.password.length < 6) {
      return 'Password must be at least 6 characters'
    }
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const message = validate()
    if (message) {
      setError(message)
      return
    }

    setLoading(true)
    try {
      const data = isSignup
        ? await signup(form)
        : await login({ email: form.email, password: form.password })
      onAuth(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setError('')
    setForm({ name: '', email: '', password: '' })
    onSwitch(isSignup ? 'login' : 'signup')
  }

  return (
    <div className="page">
      <div className="card">
        <div className="logo">&lt;/&gt;</div>
        <h1>{isSignup ? 'Create account' : 'Welcome back'}</h1>
        <p className="subtitle">
          {isSignup
            ? 'Sign up to get started in seconds.'
            : 'Log in to continue to your account.'}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <label>
              Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <p className="switch">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" className="link" onClick={switchMode}>
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
