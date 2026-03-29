import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/users')
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { users, loading, error, refresh }
}
