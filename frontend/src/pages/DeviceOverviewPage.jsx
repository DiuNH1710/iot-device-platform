import { useState, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useTelemetry, useTelemetryStats } from "../hooks/useTelemetry";
import { useAlertRules } from "../hooks/useAlertRules";
import { extractMetricKeys } from "../utils/telemetry";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { MetricSelector } from "../components/MetricSelector";
import { TelemetryChart } from "../components/TelemetryChart";
import { TelemetryMultiChart } from "../components/TelemetryMultiChart";
import { TelemetryTable } from "../components/TelemetryTable";
import { AlertRulesPanel } from "../components/AlertRulesPanel";
import api from "../services/api";
import { vi } from "../constants/i18n";

function getErrorMessage(err) {
  const d = err.response?.data;
  if (typeof d?.detail === "string") return d.detail;
  if (Array.isArray(d?.detail))
    return d.detail.map((x) => x.msg || x).join(", ");
  return err.message || vi.deviceOverview.errorFallback;
}

export function DeviceOverviewPage() {
  const { deviceId, isOwner } = useOutletContext();
  const navigate = useNavigate();
  const [rangePreset, setRangePreset] = useState("24h");

  const {
    telemetry,
    loading: telLoading,
    error: telError,
    refresh: refreshTelemetry,
  } = useTelemetry(deviceId, {
    limit: 1000,
    timeRangePreset: rangePreset,
  });

  const metrics = useMemo(() => extractMetricKeys(telemetry), [telemetry]);
  const [statsMetric, setStatsMetric] = useState("");
  const [plotMetrics, setPlotMetrics] = useState([]);

  useEffect(() => {
    if (!metrics.length) {
      setStatsMetric("");
      setPlotMetrics([]);
      return;
    }
    setStatsMetric((prev) =>
      prev && metrics.includes(prev) ? prev : metrics[0],
    );
    setPlotMetrics((prev) => {
      const next = prev.filter((m) => metrics.includes(m));
      if (next.length) return next;
      return [metrics[0]];
    });
  }, [metrics]);

  const { stats, loading: statsLoading } = useTelemetryStats(
    deviceId,
    statsMetric,
  );
  const {
    rules,
    loading: rulesLoading,
    refresh: refreshRules,
  } = useAlertRules(deviceId);

  const [viewMode, setViewMode] = useState("chart");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const togglePlotMetric = (key) => {
    setPlotMetrics((prev) => {
      if (prev.includes(key)) {
        const next = prev.filter((k) => k !== key);
        return next.length ? next : [key];
      }
      return [...prev, key];
    });
  };

  const handleDeleteDevice = async () => {
    if (!window.confirm(vi.deviceOverview.deleteConfirm)) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/devices/${deviceId}`);
      navigate("/devices");
    } catch (e) {
      alert(getErrorMessage(e));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isOwner && (
          <Button
            className="cursor-pointer"
            type="button"
            variant="danger"
            onClick={handleDeleteDevice}
            disabled={deleteLoading}
          >
            {deleteLoading
              ? vi.common.deleting
              : vi.deviceOverview.deleteDevice}
          </Button>
        )}
      </div>

      <Card title={vi.deviceOverview.telemetry}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              {vi.deviceOverview.timeRange}
            </label>
            <select
              className="input-box max-w-xs"
              value={rangePreset}
              onChange={(e) => setRangePreset(e.target.value)}
            >
              <option value="1h">{vi.deviceOverview.range1h}</option>
              <option value="24h">{vi.deviceOverview.range24h}</option>
              <option value="7d">{vi.deviceOverview.range7d}</option>
              <option value="all">{vi.deviceOverview.rangeAll}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              {vi.common.view}
            </label>
            <div className="flex rounded-lg border border-slate-200 p-0.5">
              <button
                type="button"
                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm ${viewMode === "chart" ? "bg-indigo-100 text-indigo-900" : "text-slate-600"}`}
                onClick={() => setViewMode("chart")}
              >
                {vi.common.chart}
              </button>
              <button
                type="button"
                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm ${viewMode === "table" ? "bg-indigo-100 text-indigo-900" : "text-slate-600"}`}
                onClick={() => setViewMode("table")}
              >
                {vi.common.table}
              </button>
            </div>
          </div>
          <Button
            className="cursor-pointer"
            type="button"
            variant="secondary"
            onClick={() => {
              void refreshTelemetry();
              void refreshStats();
            }}
          >
            {vi.common.refresh}
          </Button>
        </div>

        {telError && (
          <p className="mb-4 text-sm text-red-600">
            {getErrorMessage(telError)}
          </p>
        )}

        {metrics.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-slate-700">
              {vi.deviceOverview.metricsToPlot}
            </p>
            <div className="flex flex-wrap gap-3">
              {metrics.map((m) => (
                <label
                  key={m}
                  className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={plotMetrics.includes(m)}
                    onChange={() => togglePlotMetric(m)}
                    className="cursor-pointer rounded border-slate-300 text-indigo-600"
                  />
                  {m}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {vi.deviceOverview.metricsHint}
            </p>
          </div>
        )}

        {viewMode === "table" ? (
          <TelemetryTable rows={telemetry} />
        ) : plotMetrics.length <= 1 ? (
          <TelemetryChart
            telemetry={telemetry}
            metricKey={plotMetrics[0] || statsMetric}
            loading={telLoading}
          />
        ) : (
          <TelemetryMultiChart
            telemetry={telemetry}
            metricKeys={plotMetrics}
            loading={telLoading}
          />
        )}
      </Card>

      <Card title={vi.deviceOverview.statistics}>
        <div className="mb-4">
          <MetricSelector
            metrics={metrics}
            value={statsMetric}
            onChange={setStatsMetric}
            label={vi.deviceOverview.metricForStats}
          />
        </div>
        {!statsMetric ? (
          <p className="text-sm text-slate-500">
            {vi.deviceOverview.selectMetric}
          </p>
        ) : statsLoading ? (
          <p className="text-slate-500">{vi.deviceOverview.loadingStats}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                {vi.common.average}
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {stats?.avg != null
                  ? Number(stats.avg).toFixed(4)
                  : vi.common.dash}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                {vi.common.max}
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {stats?.max != null
                  ? Number(stats.max).toFixed(4)
                  : vi.common.dash}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">
                {vi.common.min}
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {stats?.min != null
                  ? Number(stats.min).toFixed(4)
                  : vi.common.dash}
              </p>
            </div>
          </div>
        )}
      </Card>

      <Card title={vi.deviceOverview.alertRules}>
        <AlertRulesPanel
          isOwner={isOwner}
          deviceId={deviceId}
          metricOptions={metrics}
          rules={rules}
          loading={rulesLoading}
          onRefresh={refreshRules}
        />
      </Card>
    </div>
  );
}
