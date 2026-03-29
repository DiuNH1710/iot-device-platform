import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useViewers(deviceId) {
  const [viewers, setViewers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (deviceId == null || deviceId === '') return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/devices/${deviceId}/viewers`)
      setViewers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e)
      setViewers([])
    } finally {
      setLoading(false)
    }
  }, [deviceId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { viewers, loading, error, refresh }
}
