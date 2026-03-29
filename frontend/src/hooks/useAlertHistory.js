import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useAlertHistory(deviceId, limit = 100) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (deviceId == null || deviceId === '') return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/alert-rules/device/${deviceId}`, {
        params: { limit },
      })
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [deviceId, limit])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { items, loading, error, refresh }
}
