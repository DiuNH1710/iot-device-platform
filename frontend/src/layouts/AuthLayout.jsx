import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">IoT Device Platform</h1>
          <p className="mt-1 text-sm text-slate-600">Device management dashboard</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
