import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card } from '../components/Card'
import { vi } from '../constants/i18n'

function getErrorMessage(err) {
  const d = err.response?.data
  if (typeof d?.detail === 'string') return d.detail
  if (Array.isArray(d?.detail)) return d.detail.map((x) => x.msg || x).join(', ')
  return err.message || vi.errors.registerFailed
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', { username, email, password })
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-6 text-center text-xl font-semibold text-slate-900">{vi.register.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={vi.login.username} name="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input label={vi.register.email} name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          label={vi.login.password}
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? vi.common.creating : vi.register.submit}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        {vi.register.hasAccount}{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800">
          {vi.register.signInLink}
        </Link>
      </p>
    </Card>
  )
}
