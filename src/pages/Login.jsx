import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login() {
  const { login, user, isAdmin, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!loading && user && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message || 'البريد أو كلمة المرور غير صحيحة')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-icon">
          <i className="fa-solid fa-lock" />
          <span className="login-key"><i className="fa-solid fa-key" /></span>
        </div>
        <h1 className="login-title">تسجيل دخول الموظفين</h1>
        <p className="login-sub">أدخل بياناتك للوصول إلى لوحة التحكم</p>

        {error && (
          <div className="login-error">
            <i className="fa-solid fa-circle-exclamation" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>البريد الإلكتروني</label>
            <div className="login-input-wrap">
              <i className="fa-solid fa-envelope login-field-icon" />
              <input
                type="email"
                placeholder="admin@gharim.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>
          <div className="login-field">
            <label>كلمة المرور</label>
            <div className="login-input-wrap">
              <i className="fa-solid fa-lock login-field-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>

        <Link to="/" className="login-back">
          <i className="fa-solid fa-arrow-right" /> العودة للمتجر
        </Link>
      </div>
    </div>
  )
}
