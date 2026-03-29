import { useOutletContext } from 'react-router-dom'
import { useAlertHistory } from '../hooks/useAlertHistory'
import { Card } from '../components/Card'
import { vi } from '../constants/i18n'

function severityClass(message) {
  const m = (message || '').toLowerCase()
  if (m.includes('critical') || m.includes('severe')) return 'bg-red-100 text-red-800'
  if (m.includes('warn')) return 'bg-amber-100 text-amber-800'
  return 'bg-slate-100 text-slate-700'
}

export function DeviceAlertHistoryPage() {
  const { deviceId } = useOutletContext()
  const { items, loading, error } = useAlertHistory(deviceId, 200)

  return (
    <Card title={vi.deviceAlertHistory.title}>
      <p className="mb-4 text-sm text-slate-600">{vi.deviceAlertHistory.intro}</p>

      {error && <p className="mb-4 text-sm text-red-600">{vi.deviceAlertHistory.loadError}</p>}

      {loading ? (
        <p className="text-slate-500">{vi.common.loading}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">{vi.deviceAlertHistory.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700">{vi.common.severity}</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">{vi.common.message}</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">{vi.common.sentTo}</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">{vi.common.sentAt}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {items.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap px-3 py-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${severityClass(row.message)}`}>
                      {vi.deviceAlertHistory.badgeInfo}
                    </span>
                  </td>
                  <td className="max-w-md px-3 py-2 text-slate-800">{row.message}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">{row.sent_to}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">{row.sent_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
