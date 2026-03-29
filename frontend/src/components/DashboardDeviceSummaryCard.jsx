import { Link } from 'react-router-dom'
import { IoChevronForward } from 'react-icons/io5'
import { Card } from './Card'
import { vi } from '../constants/i18n'

function DataPreview({ data }) {
  if (!data || typeof data !== 'object') {
    return <p className="text-sm text-slate-500">{vi.dashboardCard.noTelemetry}</p>
  }
  const entries = Object.entries(data).slice(0, 6)
  return (
    <dl className="grid grid-cols-2 gap-2 text-sm">
      {entries.map(([k, v]) => (
        <div key={k} className="rounded bg-slate-50 px-2 py-1">
          <dt className="text-xs text-slate-500">{k}</dt>
          <dd className="font-mono text-slate-900">{v === null || v === undefined ? vi.common.dash : String(v)}</dd>
        </div>
      ))}
    </dl>
  )
}

export function DashboardDeviceSummaryCard({ device, latest, alertCount, ownerId }) {
  const isOwner = ownerId != null && Number(device.owner_id) === Number(ownerId)

  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">{device.name || vi.common.unnamedDevice}</h3>
          <p className="text-xs text-slate-500">
            {vi.common.imei}: {device.imei}
          </p>
        </div>
        <Link
          to={`/devices/${device.id}`}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          {vi.common.open} <IoChevronForward className="h-4 w-4" />
        </Link>
      </div>

      <p className="mb-2 text-xs font-medium uppercase text-slate-500">{vi.dashboardCard.latestTelemetry}</p>
      <DataPreview data={latest?.data} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm">
        <span className="text-slate-600">
          {vi.dashboardCard.recentAlerts}{' '}
          <strong className="text-slate-900">{alertCount ?? vi.common.dash}</strong>
        </span>
        <Link to={`/devices/${device.id}/alerts/history`} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
          {vi.dashboardCard.historyLink}
        </Link>
      </div>

      {isOwner && <p className="mt-2 text-xs text-slate-400">{vi.dashboardCard.youOwn}</p>}
    </Card>
  )
}
