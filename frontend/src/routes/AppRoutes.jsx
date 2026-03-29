import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { DeviceLayout } from '../layouts/DeviceLayout'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { DashboardPage } from '../pages/DashboardPage'
import { DeviceListPage } from '../pages/DeviceListPage'
import { DeviceOverviewPage } from '../pages/DeviceOverviewPage'
import { DeviceAttributesPage } from '../pages/DeviceAttributesPage'
import { DeviceViewersPage } from '../pages/DeviceViewersPage'
import { DeviceAlertHistoryPage } from '../pages/DeviceAlertHistoryPage'
import { AlertsPage } from '../pages/AlertsPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/devices" element={<DeviceListPage />} />
        <Route path="/devices/:id" element={<DeviceLayout />}>
          <Route index element={<DeviceOverviewPage />} />
          <Route path="attributes" element={<DeviceAttributesPage />} />
          <Route path="viewers" element={<DeviceViewersPage />} />
          <Route path="alerts/history" element={<DeviceAlertHistoryPage />} />
        </Route>
        <Route path="/alerts" element={<AlertsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
