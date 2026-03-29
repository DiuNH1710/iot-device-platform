import { NavLink } from 'react-router-dom'
import { vi } from '../constants/i18n'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-100 text-indigo-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export function DeviceSubNav({ deviceId }) {
  const base = `/devices/${deviceId}`

  return (
    <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      <NavLink to={base} end className={linkClass}>
        {vi.deviceSubNav.overview}
      </NavLink>
      <NavLink to={`${base}/attributes`} className={linkClass}>
        {vi.deviceSubNav.attributes}
      </NavLink>
      <NavLink to={`${base}/alerts/history`} className={linkClass}>
        {vi.deviceSubNav.alertHistory}
      </NavLink>
      <NavLink to={`${base}/viewers`} className={linkClass}>
        {vi.deviceSubNav.viewers}
      </NavLink>
    </nav>
  )
}
