import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { parseJwtPayload } from '../utils/jwt'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem('token'))
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '')

  const userId = useMemo(() => {
    if (!token) return null
    const p = parseJwtPayload(token)
    return p?.user_id ?? null
  }, [token])

  const setToken = useCallback((newToken, name) => {
    if (newToken) {
      localStorage.setItem('token', newToken)
      setTokenState(newToken)
      if (name != null) {
        localStorage.setItem('username', name)
        setUsername(name)
      }
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      setTokenState(null)
      setUsername('')
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
  }, [setToken])

  const value = useMemo(
    () => ({
      token,
      userId,
      username,
      isAuthenticated: Boolean(token),
      setToken,
      logout,
    }),
    [token, userId, username, setToken, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
