import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

/**
 * @param {string|number|undefined} deviceId
 * @param {{ limit?: number }} [opts]
 */
export function useTelemetry(deviceId, opts = {}) {
  const { limit = 200 } = opts
  const [telemetry, setTelemetry] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (deviceId == null || deviceId === '') return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/devices/${deviceId}/telemetry`, {
        params: { limit },
      })
      setTelemetry(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e)
      setTelemetry([])
    } finally {
      setLoading(false)
    }
  }, [deviceId, limit])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { telemetry, loading, error, refresh }
}

/**
 * @param {string|number|undefined} deviceId
 * @param {string|undefined} metric — required by backend
 */
export function useTelemetryStats(deviceId, metric) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (deviceId == null || deviceId === '' || !metric || !String(metric).trim()) {
      setStats(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/devices/${deviceId}/telemetry/stats`, {
        params: { metric: String(metric).trim() },
      })
      setStats(data)
    } catch (e) {
      setError(e)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [deviceId, metric])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, loading, error, refresh }
}
