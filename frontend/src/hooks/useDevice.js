import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useDevice(deviceId) {
  const [device, setDevice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (deviceId == null || deviceId === '') {
      setDevice(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/devices/${deviceId}`)
      setDevice(data)
    } catch (e) {
      setError(e)
      setDevice(null)
    } finally {
      setLoading(false)
    }
  }, [deviceId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { device, loading, error, refresh }
}
