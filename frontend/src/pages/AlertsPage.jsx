import { Link } from 'react-router-dom'
import { IoChevronForward } from 'react-icons/io5'
import { useDevices } from '../hooks/useDevices'
import { Card } from '../components/Card'

export function AlertsPage() {
  const { devices, loading, error } = useDevices()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
        <p className="mt-1 text-slate-600">
          Alert rules are configured per device. Select a device to view or create rules (owner only).
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Could not load devices.
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : devices.length === 0 ? (
        <Card>
          <p className="text-slate-600">No devices yet.</p>
          <Link to="/devices" className="mt-2 inline-block text-sm font-medium text-indigo-600">
            Add a device
          </Link>
        </Card>
      ) : (
        <ul className="space-y-3">
          {devices.map((d) => (
            <li key={d.id}>
              <Card className="!p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{d.name || 'Unnamed device'}</h3>
                    <p className="text-sm text-slate-500">{d.imei}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      to={`/devices/${d.id}/alerts/history`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      History
                    </Link>
                    <Link
                      to={`/devices/${d.id}`}
                      className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Rules <IoChevronForward className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
