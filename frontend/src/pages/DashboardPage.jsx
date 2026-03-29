import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { IoHardwareChipOutline, IoNotificationsOutline } from 'react-icons/io5'
import { useDevices } from '../hooks/useDevices'
import { useAuth } from '../context/AuthContext'
import { Card } from '../components/Card'
import { DashboardDeviceSummaryCard } from '../components/DashboardDeviceSummaryCard'
import api from '../services/api'

export function DashboardPage() {
  const { devices, loading, error } = useDevices()
  const { userId } = useAuth()
  const [insights, setInsights] = useState({})

  useEffect(() => {
    if (!devices.length) {
      setInsights({})
      return
    }
    let cancelled = false
    ;(async () => {
      const next = {}
      await Promise.all(
        devices.map(async (d) => {
          let latest = null
          let alertCount = 0
          try {
            const r = await api.get(`/devices/${d.id}/telemetry/latest`)
            latest = r.data
          } catch {
            latest = null
          }
          try {
            const r = await api.get(`/alert-rules/device/${d.id}`, { params: { limit: 100 } })
            alertCount = Array.isArray(r.data) ? r.data.length : 0
          } catch {
            alertCount = 0
          }
          next[d.id] = { latest, alertCount }
        })
      )
      if (!cancelled) setInsights(next)
    })()
    return () => {
      cancelled = true
    }
  }, [devices])

  const totalAlerts = Object.values(insights).reduce((acc, x) => acc + (x.alertCount || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">Overview of your connected devices and recent activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
              <IoHardwareChipOutline className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Devices</p>
              <p className="text-2xl font-semibold text-slate-900">{loading ? '—' : devices.length}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
              <IoNotificationsOutline className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Alert rows (loaded)</p>
              <p className="text-2xl font-semibold text-slate-900">
                {loading ? '—' : devices.length ? totalAlerts : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Failed to load devices. Check API and authentication.
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading devices…</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your devices</h2>
            <Link to="/devices" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
              Manage devices →
            </Link>
          </div>
          {devices.length === 0 ? (
            <Card>
              <p className="text-slate-600">No devices yet.</p>
              <Link to="/devices" className="mt-2 inline-block text-sm font-medium text-indigo-600">
                Add a device
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {devices.map((d) => (
                <DashboardDeviceSummaryCard
                  key={d.id}
                  device={d}
                  latest={insights[d.id]?.latest}
                  alertCount={insights[d.id]?.alertCount}
                  ownerId={userId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
