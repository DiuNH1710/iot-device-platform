import { useState, useEffect, useMemo } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { useTelemetry, useTelemetryStats } from '../hooks/useTelemetry'
import { useAlertRules } from '../hooks/useAlertRules'
import { extractMetricKeys } from '../utils/telemetry'
import { presetToQueryParams } from '../utils/timeRange'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { MetricSelector } from '../components/MetricSelector'
import { TelemetryChart } from '../components/TelemetryChart'
import { TelemetryMultiChart } from '../components/TelemetryMultiChart'
import { TelemetryTable } from '../components/TelemetryTable'
import { AlertRulesPanel } from '../components/AlertRulesPanel'
import api from '../services/api'

function getErrorMessage(err) {
  const d = err.response?.data
  if (typeof d?.detail === 'string') return d.detail
  if (Array.isArray(d?.detail)) return d.detail.map((x) => x.msg || x).join(', ')
  return err.message || 'Request failed'
}

export function DeviceOverviewPage() {
  const { deviceId, isOwner } = useOutletContext()
  const navigate = useNavigate()
  const [rangePreset, setRangePreset] = useState('24h')
  const rangeParams = useMemo(() => presetToQueryParams(rangePreset), [rangePreset])

  const { telemetry, loading: telLoading, error: telError, refresh: refreshTelemetry } = useTelemetry(deviceId, {
    limit: 1000,
    ...rangeParams,
  })

  const metrics = useMemo(() => extractMetricKeys(telemetry), [telemetry])
  const [statsMetric, setStatsMetric] = useState('')
  const [plotMetrics, setPlotMetrics] = useState([])

  useEffect(() => {
    if (!metrics.length) {
      setStatsMetric('')
      setPlotMetrics([])
      return
    }
    setStatsMetric((prev) => (prev && metrics.includes(prev) ? prev : metrics[0]))
    setPlotMetrics((prev) => {
      const next = prev.filter((m) => metrics.includes(m))
      if (next.length) return next
      return [metrics[0]]
    })
  }, [metrics])

  const { stats, loading: statsLoading } = useTelemetryStats(deviceId, statsMetric)
  const { rules, loading: rulesLoading, refresh: refreshRules } = useAlertRules(deviceId)

  const [viewMode, setViewMode] = useState('chart')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const togglePlotMetric = (key) => {
    setPlotMetrics((prev) => {
      if (prev.includes(key)) {
        const next = prev.filter((k) => k !== key)
        return next.length ? next : [key]
      }
      return [...prev, key]
    })
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isOwner && (
          <Button type="button" variant="danger" onClick={handleDeleteDevice} disabled={deleteLoading}>
            {deleteLoading ? 'Deleting…' : 'Delete device'}
          </Button>
        )}
      </div>

      <Card title="Telemetry">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Time range</label>
            <select
              className="input-box max-w-xs"
              value={rangePreset}
              onChange={(e) => setRangePreset(e.target.value)}
            >
              <option value="1h">Last 1 hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="all">All (limit applies)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">View</label>
            <div className="flex rounded-lg border border-slate-200 p-0.5">
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm ${viewMode === 'chart' ? 'bg-indigo-100 text-indigo-900' : 'text-slate-600'}`}
                onClick={() => setViewMode('chart')}
              >
                Chart
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm ${viewMode === 'table' ? 'bg-indigo-100 text-indigo-900' : 'text-slate-600'}`}
                onClick={() => setViewMode('table')}
              >
                Table
              </button>
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={() => refreshTelemetry()}>
            Refresh
          </Button>
        </div>

        {telError && <p className="mb-4 text-sm text-red-600">{getErrorMessage(telError)}</p>}

        {metrics.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Metrics to plot</p>
            <div className="flex flex-wrap gap-3">
              {metrics.map((m) => (
                <label key={m} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={plotMetrics.includes(m)}
                    onChange={() => togglePlotMetric(m)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  {m}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Select one or more metrics. Single selection uses a compact chart.</p>
          </div>
        )}

        {viewMode === 'table' ? (
          <TelemetryTable rows={telemetry} />
        ) : plotMetrics.length <= 1 ? (
          <TelemetryChart
            telemetry={telemetry}
            metricKey={plotMetrics[0] || statsMetric}
            loading={telLoading}
          />
        ) : (
          <TelemetryMultiChart telemetry={telemetry} metricKeys={plotMetrics} loading={telLoading} />
        )}
      </Card>

      <Card title="Statistics">
        <div className="mb-4">
          <MetricSelector metrics={metrics} value={statsMetric} onChange={setStatsMetric} label="Metric for stats" />
        </div>
        {!statsMetric ? (
          <p className="text-sm text-slate-500">Select a metric.</p>
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
        <AlertRulesPanel
          isOwner={isOwner}
          deviceId={deviceId}
          metricOptions={metrics}
          rules={rules}
          loading={rulesLoading}
          onRefresh={refreshRules}
        />
      </Card>
    </div>
  )
}
