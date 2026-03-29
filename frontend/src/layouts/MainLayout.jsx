import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { IoGridOutline, IoHardwareChipOutline, IoNotificationsOutline, IoLogOutOutline } from 'react-icons/io5'
import { useAuth } from '../context/AuthContext'
import { vi } from '../constants/i18n'

const navCls = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-indigo-100 text-indigo-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export function MainLayout() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white md:block">
        <div className="flex h-14 items-center border-b border-slate-200 px-4">
          <span className="font-semibold text-slate-900">{vi.nav.brand}</span>
        </div>
        <nav className="space-y-1 p-3">
          <NavLink to="/dashboard" className={navCls} end>
            <IoGridOutline className="h-5 w-5" /> {vi.nav.dashboard}
          </NavLink>
          <NavLink to="/devices" className={navCls}>
            <IoHardwareChipOutline className="h-5 w-5" /> {vi.nav.devices}
          </NavLink>
          <NavLink to="/alerts" className={navCls}>
            <IoNotificationsOutline className="h-5 w-5" /> {vi.nav.alerts}
          </NavLink>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 md:px-6">
          <nav className="flex items-center gap-2 md:hidden">
            <NavLink to="/dashboard" className={navCls} end>
              <IoGridOutline className="h-4 w-4" />
            </NavLink>
            <NavLink to="/devices" className={navCls}>
              <IoHardwareChipOutline className="h-4 w-4" />
            </NavLink>
            <NavLink to="/alerts" className={navCls}>
              <IoNotificationsOutline className="h-4 w-4" />
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{username || vi.common.user}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <IoLogOutOutline className="h-4 w-4" />
              {vi.nav.logout}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
