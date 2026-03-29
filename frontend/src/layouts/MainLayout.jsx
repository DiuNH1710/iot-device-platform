import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { IoGridOutline, IoHardwareChipOutline, IoNotificationsOutline, IoLogOutOutline } from 'react-icons/io5'
import { useAuth } from '../context/AuthContext'
import { vi } from '../constants/i18n'

const sidebarLinkBase =
  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200'

const navInactive = `${sidebarLinkBase} text-slate-600 hover:bg-slate-100 hover:text-slate-900`

const navCls = ({ isActive }) =>
  isActive
    ? `${sidebarLinkBase} bg-indigo-500 text-white shadow-sm hover:bg-indigo-600`
    : navInactive

const logoutItemCls = `${sidebarLinkBase} w-full text-left text-slate-600 hover:bg-slate-100 hover:text-slate-900`

const sidebarNavCls = (props) => `${navCls(props)} w-full`

export function MainLayout() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const displayName = username || vi.common.user
  const avatarLetter = displayName.trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="h-screen overflow-hidden bg-slate-50 md:pl-56">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-14 shrink-0 items-center border-b border-slate-200 px-4">
          <span className="font-semibold text-slate-900">{vi.nav.brand}</span>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-4 py-3">
          <NavLink to="/dashboard" className={sidebarNavCls} end>
            <IoGridOutline className="h-5 w-5 shrink-0" /> {vi.nav.dashboard}
          </NavLink>
          <NavLink to="/devices" className={sidebarNavCls}>
            <IoHardwareChipOutline className="h-5 w-5 shrink-0" /> {vi.nav.devices}
          </NavLink>
          <NavLink to="/alerts" className={sidebarNavCls}>
            <IoNotificationsOutline className="h-5 w-5 shrink-0" /> {vi.nav.alerts}
          </NavLink>
        </nav>
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
          <button type="button" onClick={handleLogout} className={logoutItemCls}>
            <IoLogOutOutline className="h-5 w-5 shrink-0" />
            {vi.nav.logout}
          </button>
        </div>
      </aside>

      <header className="fixed top-0 right-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm md:left-56 md:px-6">
        <nav className="flex min-w-0 flex-wrap items-center gap-2 md:hidden">
          <NavLink to="/dashboard" className={navCls} end>
            <IoGridOutline className="h-4 w-4 shrink-0" />
          </NavLink>
          <NavLink to="/devices" className={navCls}>
            <IoHardwareChipOutline className="h-4 w-4 shrink-0" />
          </NavLink>
          <NavLink to="/alerts" className={navCls}>
            <IoNotificationsOutline className="h-4 w-4 shrink-0" />
          </NavLink>
          <button type="button" onClick={handleLogout} className={navInactive}>
            <IoLogOutOutline className="h-4 w-4 shrink-0" />
            {vi.nav.logout}
          </button>
        </nav>
        <div className="ml-auto flex min-w-0 items-center justify-end">
          <div
            className="group flex max-w-[min(100%,18rem)] min-w-0 items-center gap-3 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 px-2 py-1.5 pl-2 pr-3 text-white shadow-sm ring-1 ring-white/15 transition-all duration-200 hover:shadow-md hover:brightness-105 sm:pr-4"
            title={displayName}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-semibold uppercase backdrop-blur-[2px] transition-transform duration-200 group-hover:scale-105"
              aria-hidden
            >
              {avatarLetter}
            </div>
            <span className="hidden min-w-0 truncate text-sm font-medium sm:inline">{displayName}</span>
          </div>
        </div>
      </header>

      <main className="box-border h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-4 pb-4 pt-14 md:px-6 md:pb-6">
        <Outlet />
      </main>
    </div>
  )
}
