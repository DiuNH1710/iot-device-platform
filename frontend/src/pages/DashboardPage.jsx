import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoHardwareChipOutline, IoNotificationsOutline } from "react-icons/io5";
import { useDevices } from "../hooks/useDevices";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/Card";
import { DashboardDeviceSummaryCard } from "../components/DashboardDeviceSummaryCard";
import api from "../services/api";
import { vi } from "../constants/i18n";

export function DashboardPage() {
  const { devices, loading, error } = useDevices();
  const { userId } = useAuth();
  const [insights, setInsights] = useState({});

  useEffect(() => {
    if (!devices.length) {
      setInsights({});
      return;
    }
    let cancelled = false;
    (async () => {
      const next = {};
      await Promise.all(
        devices.map(async (d) => {
          let latest = null;
          let alertCount = 0;
          try {
            const r = await api.get(`/devices/${d.id}/telemetry/latest`);
            latest = r.data;
          } catch {
            latest = null;
          }
          try {
            const r = await api.get(`/alert-rules/device/${d.id}`, {
              params: { limit: 100 },
            });
            alertCount = Array.isArray(r.data) ? r.data.length : 0;
          } catch {
            alertCount = 0;
          }
          next[d.id] = { latest, alertCount };
        }),
      );
      if (!cancelled) setInsights(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [devices]);

  const totalAlerts = Object.values(insights).reduce(
    (acc, x) => acc + (x.alertCount || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {vi.dashboard.title}
        </h1>
        <p className="mt-1 text-slate-600">{vi.dashboard.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
              <IoHardwareChipOutline className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">
                {vi.dashboard.statDevices}
              </p>
              <p className="text-2xl font-semibold text-slate-900">
                {loading ? vi.common.dash : devices.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
              <IoNotificationsOutline className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">
                {vi.dashboard.statAlertRows}
              </p>
              <p className="text-2xl font-semibold text-slate-900">
                {loading ? vi.common.dash : devices.length ? totalAlerts : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {vi.dashboard.loadError}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">{vi.dashboard.loadingDevices}</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {vi.dashboard.sectionDevices}
            </h2>
            <Link
              to="/devices"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              {vi.dashboard.manageDevices}
            </Link>
          </div>
          {devices.length === 0 ? (
            <Card>
              <p className="text-slate-600">{vi.dashboard.empty}</p>
              <Link
                to="/devices"
                className="mt-2 inline-block text-sm font-medium text-indigo-600"
              >
                {vi.dashboard.addDevice}
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {devices.map((d) => (
                <DashboardDeviceSummaryCard
                  key={d.id}
                  device={d}
                  latest={insights[d.id]?.latest}
                  alertCount={insights[d.id]?.alertCount}
                  ownerId={userId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
