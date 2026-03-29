import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTelemetry, useTelemetryStats } from '../hooks/useTelemetry'
import { extractMetricKeys } from '../utils/telemetry'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { MetricSelector } from '../components/MetricSelector'
import { TelemetryChart } from '../components/TelemetryChart'
import { AlertForm } from '../components/AlertForm'

function getErrorMessage(err) {
  const d = err.response?.data
  if (typeof d?.detail === 'string') return d.detail
  if (Array.isArray(d?.detail)) return d.detail.map((x) => x.msg || x).join(', ')
  return err.message || 'Request failed'
}

export function DeviceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userId } = useAuth()
  const deviceId = id

  const [device, setDevice] = useState(null)
  const [deviceLoading, setDeviceLoading] = useState(true)
  const [deviceError, setDeviceError] = useState(null)

  const { telemetry, loading: telLoading, error: telError, refresh: refreshTelemetry } = useTelemetry(deviceId, {
    limit: 200,
  })

  const [selectedMetric, setSelectedMetric] = useState('')
  const metrics = useMemo(() => extractMetricKeys(telemetry), [telemetry])

  useEffect(() => {
    if (!metrics.length) {
      setSelectedMetric('')
      return
    }
    setSelectedMetric((prev) => (prev && metrics.includes(prev) ? prev : metrics[0]))
  }, [metrics])

  const { stats, loading: statsLoading } = useTelemetryStats(deviceId, selectedMetric)

  const [rules, setRules] = useState([])
  const [rulesLoading, setRulesLoading] = useState(false)
  const [rulesError, setRulesError] = useState(null)

  const [alertSubmitting, setAlertSubmitting] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadDevice = useCallback(async () => {
    if (!deviceId) return
    setDeviceLoading(true)
    setDeviceError(null)
    try {
      const { data } = await api.get(`/devices/${deviceId}`)
      setDevice(data)
    } catch (e) {
      setDeviceError(e)
      setDevice(null)
    } finally {
      setDeviceLoading(false)
    }
  }, [deviceId])

  const loadRules = useCallback(async () => {
    if (!deviceId) return
    setRulesLoading(true)
    setRulesError(null)
    try {
      const { data } = await api.get(`/alert-rules/${deviceId}`)
      setRules(Array.isArray(data) ? data : [])
    } catch (e) {
      setRulesError(e)
      setRules([])
    } finally {
      setRulesLoading(false)
    }
  }, [deviceId])

  useEffect(() => {
    loadDevice()
  }, [loadDevice])

  useEffect(() => {
    loadRules()
  }, [loadRules])

  const handleCreateRule = async (payload) => {
    setAlertSubmitting(true)
    try {
      await api.post('/alert-rules/', {
        device_id: Number(deviceId),
        metric_name: payload.metric_name,
        condition: payload.condition,
        threshold: payload.threshold,
        message: payload.message,
      })
      await loadRules()
    } catch (e) {
      alert(getErrorMessage(e))
    } finally {
      setAlertSubmitting(false)
    }
  }

  const handleDeleteDevice = async () => {
    if (!window.confirm('Delete this device? This cannot be undone.')) return
    setDeleteLoading(true)
    try {
      await api.delete(`/devices/${deviceId}`)
      navigate('/devices')
    } catch (e) {
      alert(getErrorMessage(e))
    } finally {
      setDeleteLoading(false)
    }
  }

  const isOwner = userId != null && device?.owner_id === userId

  if (deviceLoading) {
    return <p className="text-slate-500">Loading device…</p>
  }

  if (deviceError || !device) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        {deviceError ? getErrorMessage(deviceError) : 'Device not found.'}
        <Link to="/devices" className="mt-2 block text-sm font-medium text-indigo-600">
          ← Back to devices
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/devices" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            ← Devices
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{device.name}</h1>
          <p className="mt-1 text-slate-600">IMEI: {device.imei}</p>
          {device.description && <p className="mt-2 text-slate-700">{device.description}</p>}
        </div>
        {isOwner && (
          <Button type="button" variant="danger" onClick={handleDeleteDevice} disabled={deleteLoading}>
            {deleteLoading ? 'Deleting…' : 'Delete device'}
          </Button>
        )}
      </div>

      <Card title="Telemetry">
        {telError && (
          <p className="mb-4 text-sm text-red-600">{getErrorMessage(telError)}</p>
        )}
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <MetricSelector metrics={metrics} value={selectedMetric} onChange={setSelectedMetric} disabled={telLoading} />
          <Button type="button" variant="secondary" onClick={() => refreshTelemetry()}>
            Refresh data
          </Button>
        </div>
        <TelemetryChart telemetry={telemetry} metricKey={selectedMetric} loading={telLoading} />
      </Card>

      <Card title="Statistics">
        {!selectedMetric ? (
          <p className="text-sm text-slate-500">Select a metric with data to view stats.</p>
        ) : statsLoading ? (
          <p className="text-slate-500">Loading stats…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">Average</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {stats?.avg != null ? Number(stats.avg).toFixed(4) : '—'}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">Max</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {stats?.max != null ? Number(stats.max).toFixed(4) : '—'}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">Min</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {stats?.min != null ? Number(stats.min).toFixed(4) : '—'}
              </p>
            </div>
          </div>
        )}
      </Card>

      <Card title="Alert rules">
        {rulesError && <p className="mb-4 text-sm text-red-600">{getErrorMessage(rulesError)}</p>}
        {rulesLoading ? (
          <p className="text-slate-500">Loading rules…</p>
        ) : rules.length === 0 ? (
          <p className="mb-6 text-sm text-slate-500">No alert rules for this device.</p>
        ) : (
          <ul className="mb-6 space-y-2">
            {rules.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-800">
                  {r.metric_name} {r.condition} {r.threshold}
                </span>
                <span className="text-slate-500">{r.enabled ? 'enabled' : 'disabled'}</span>
              </li>
            ))}
          </ul>
        )}

        {isOwner ? (
          <div className="border-t border-slate-100 pt-6">
            <h4 className="mb-4 text-sm font-semibold text-slate-900">Create rule</h4>
            <AlertForm metricOptions={metrics} onSubmit={handleCreateRule} submitting={alertSubmitting} />
            {metrics.length === 0 && (
              <p className="mt-2 text-xs text-amber-700">
                Add telemetry with numeric fields first; metric names must match keys in{' '}
                <code className="rounded bg-slate-100 px-1">data</code>.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Only the device owner can create alert rules.</p>
        )}
      </Card>
    </div>
  )
}
