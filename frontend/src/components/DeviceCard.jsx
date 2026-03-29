import { Link } from 'react-router-dom'
import { IoChevronForward } from 'react-icons/io5'
import { Card } from './Card'

export function DeviceCard({ device, showOwnerHint, ownerId }) {
  const isOwner = ownerId != null && device?.owner_id === ownerId

  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{device.name || 'Unnamed device'}</h3>
          <p className="mt-1 text-sm text-slate-500">IMEI: {device.imei}</p>
          {device.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{device.description}</p>}
          {showOwnerHint && (
            <p className="mt-2 text-xs text-slate-400">{isOwner ? 'You own this device' : 'Viewer access'}</p>
          )}
        </div>
        <Link
          to={`/devices/${device.id}`}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Open <IoChevronForward className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  )
}
