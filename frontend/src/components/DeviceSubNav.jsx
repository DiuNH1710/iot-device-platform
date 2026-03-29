import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-100 text-indigo-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export function DeviceSubNav({ deviceId }) {
  const base = `/devices/${deviceId}`

  return (
    <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      <NavLink to={base} end className={linkClass}>
        Overview
      </NavLink>
      <NavLink to={`${base}/attributes`} className={linkClass}>
        Attributes
      </NavLink>
      <NavLink to={`${base}/alerts/history`} className={linkClass}>
        Alert history
      </NavLink>
      <NavLink to={`${base}/viewers`} className={linkClass}>
        Viewers
      </NavLink>
    </nav>
  )
}
