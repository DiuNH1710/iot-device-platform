import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getNumericValueFromData } from '../utils/telemetry'
import { vi } from '../constants/i18n'

const COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0ea5e9']

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
 * @param {string[]} metricKeys
 */
export function TelemetryMultiChart({ telemetry, metricKeys, loading }) {
  if (loading) {
    return <div className="flex h-72 items-center justify-center text-slate-500">{vi.telemetry.loadingChart}</div>
  }

  if (!telemetry?.length || !metricKeys?.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-500">
        {vi.telemetry.selectOneWithData}
      </div>
    )
  }

  const chartData = telemetry
    .map((row) => {
      const point = { time: row.created_at, label: formatTime(row.created_at) }
      let any = false
      for (const key of metricKeys) {
        const v = getNumericValueFromData(row?.data, key)
        point[key] = v
        if (v !== null) any = true
      }
      return any ? point : null
    })
    .filter(Boolean)

  if (!chartData.length) {
    return (
      <div className="flex h-72 items-center justify-center text-amber-800">{vi.telemetry.noNumericMulti}</div>
    )
  }

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
          <Tooltip
            labelFormatter={(_, p) => (p?.[0]?.payload?.time ? formatTime(p[0].payload.time) : '')}
          />
          <Legend />
          {metricKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
