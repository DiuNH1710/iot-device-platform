import { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card } from '../components/Card'
import { vi } from '../constants/i18n'

function getErrorMessage(err) {
  const d = err.response?.data
  if (typeof d?.detail === 'string') return d.detail
  if (Array.isArray(d?.detail)) return d.detail.map((x) => x.msg || x).join(', ')
  return err.message || vi.errors.loginFailed
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setToken, isAuthenticated } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { username, password })
      setToken(data.access_token, username)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-6 text-center text-xl font-semibold text-slate-900">{vi.login.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={vi.login.username} name="username" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input
          label={vi.login.password}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? vi.common.signingIn : vi.login.submit}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        {vi.login.noAccount}{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-800">
          {vi.login.registerLink}
        </Link>
      </p>
    </Card>
  )
}
