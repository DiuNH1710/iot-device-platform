import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { presetToQueryParams } from '../utils/timeRange'

/**
 * @param {string|number|undefined} deviceId
 * @param {{
 *   limit?: number,
 *   timeRangePreset?: import('../utils/timeRange').TimeRangePreset,
 *   from_time?: string,
 *   to_time?: string,
 * }} [opts]
 * When `timeRangePreset` is set, `from_time` / `to_time` are recomputed on every fetch
 * (including manual refresh) so the window stays anchored to the current time.
 */
export function useTelemetry(deviceId, opts = {}) {
  const { limit = 500, timeRangePreset, from_time, to_time } = opts
  const [telemetry, setTelemetry] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (deviceId == null || deviceId === '') return
    setLoading(true)
    setError(null)
    try {
      const params = { limit }
      if (timeRangePreset != null && timeRangePreset !== '') {
        const p = presetToQueryParams(timeRangePreset)
        if (p.from_time) params.from_time = p.from_time
        if (p.to_time) params.to_time = p.to_time
      } else {
        if (from_time) params.from_time = from_time
        if (to_time) params.to_time = to_time
      }
      const { data } = await api.get(`/devices/${deviceId}/telemetry`, {
        params,
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })
      setTelemetry(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e)
      setTelemetry([])
    } finally {
      setLoading(false)
    }
  }, [deviceId, limit, timeRangePreset, from_time, to_time])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { telemetry, loading, error, refresh }
}

/**
 * @param {string|number|undefined} deviceId
 */
export function useLatestTelemetry(deviceId) {
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (deviceId == null || deviceId === '') return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/devices/${deviceId}/telemetry/latest`)
      setLatest(data)
    } catch (e) {
      setError(e)
      setLatest(null)
    } finally {
      setLoading(false)
    }
  }, [deviceId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { latest, loading, error, refresh }
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
