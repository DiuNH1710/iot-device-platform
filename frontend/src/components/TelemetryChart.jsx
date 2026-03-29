import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getNumericValueFromData } from '../utils/telemetry'
import { vi } from '../constants/i18n'

function formatTime(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return String(iso)
  }
}

/**
 * @param {Array<{ created_at: string, data: object }>} telemetry
 * @param {string} metricKey
 */
export function TelemetryChart({ telemetry, metricKey, loading }) {
  if (loading) {
    return <div className="flex h-72 items-center justify-center text-slate-500">{vi.telemetry.loadingChart}</div>
  }

  if (!telemetry?.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-500">
        {vi.telemetry.noRows}
      </div>
    )
  }

  if (!metricKey) {
    return (
      <div className="flex h-72 items-center justify-center text-slate-500">{vi.telemetry.selectMetric}</div>
    )
  }

  const chartData = telemetry
    .map((row) => {
      const v = getNumericValueFromData(row?.data, metricKey)
      return {
        time: row.created_at,
        value: v,
        label: formatTime(row.created_at),
      }
    })
    .filter((row) => row.value !== null)

  if (!chartData.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-amber-200 bg-amber-50 text-amber-800">
        {vi.telemetry.noNumericForMetric(metricKey)}
      </div>
    )
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
          <Tooltip
            labelFormatter={(_, p) => (p?.[0]?.payload?.time ? formatTime(p[0].payload.time) : '')}
            formatter={(val) => [val, metricKey]}
          />
          <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} name={metricKey} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
