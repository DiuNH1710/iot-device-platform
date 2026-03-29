import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useAttributes(deviceId) {
  const [attributes, setAttributes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (deviceId == null || deviceId === '') return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/devices/${deviceId}/attributes`)
      setAttributes(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e)
      setAttributes([])
    } finally {
      setLoading(false)
    }
  }, [deviceId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { attributes, loading, error, refresh }
}
