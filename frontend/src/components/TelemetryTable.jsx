import { extractMetricKeys } from '../utils/telemetry'
import { vi } from '../constants/i18n'

function formatCell(val) {
  if (val === null || val === undefined) return vi.common.dash
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

/**
 * @param {Array<{ id: number, created_at: string, data: object }>} rows
 */
export function TelemetryTable({ rows }) {
  if (!rows?.length) {
    return <p className="text-sm text-slate-500">{vi.telemetry.noRowsTable}</p>
  }

  const keys = extractMetricKeys(rows)

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-700">{vi.common.timeUtc}</th>
            {keys.map((k) => (
              <th key={k} className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-700">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="whitespace-nowrap px-3 py-2 text-slate-600">{row.created_at}</td>
              {keys.map((k) => (
                <td key={k} className="whitespace-nowrap px-3 py-2 text-slate-800">
                  {formatCell(row.data?.[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
