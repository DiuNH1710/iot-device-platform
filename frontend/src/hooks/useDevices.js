import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useDevices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/devices')
      setDevices(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e)
      setDevices([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { devices, loading, error, refresh }
}
