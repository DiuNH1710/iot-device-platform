import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useAlertRules(deviceId) {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (deviceId == null || deviceId === '') return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/alert-rules/${deviceId}`)
      setRules(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e)
      setRules([])
    } finally {
      setLoading(false)
    }
  }, [deviceId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { rules, loading, error, refresh }
}
