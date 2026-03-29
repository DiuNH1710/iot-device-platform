import { Outlet, useParams, Link } from 'react-router-dom'
import { useDevice } from '../hooks/useDevice'
import { useAuth } from '../context/AuthContext'
import { isDeviceOwner } from '../utils/deviceRole'
import { DeviceSubNav } from '../components/DeviceSubNav'

function getErrorMessage(err) {
  const d = err.response?.data
  if (typeof d?.detail === 'string') return d.detail
  return err.message || 'Failed to load device'
}

export function DeviceLayout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userId } = useAuth()
  const { device, loading, error, refresh } = useDevice(id)

  const isOwner = isDeviceOwner(device, userId)

  if (loading) {
    return <p className="text-slate-500">Loading device…</p>
  }

  if (error || !device) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        {error ? getErrorMessage(error) : 'Device not found.'}
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
      </div>

      <DeviceSubNav deviceId={id} />

      <Outlet
        context={{
          deviceId: id,
          device,
          isOwner,
          refreshDevice: refresh,
        }}
      />
    </div>
  )
}
