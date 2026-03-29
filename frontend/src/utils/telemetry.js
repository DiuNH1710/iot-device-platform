/**
 * Collect all keys present in telemetry row payloads (dynamic JSON).
 * @param {Array<{ data?: object }>} rows
 * @returns {string[]}
 */
export function extractMetricKeys(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return []
  const keys = new Set()
  for (const row of rows) {
    const d = row?.data
    if (d && typeof d === 'object' && !Array.isArray(d)) {
      Object.keys(d).forEach((k) => keys.add(k))
    }
  }
  return Array.from(keys).sort()
}

/**
 * Read a numeric value for charting/stats from telemetry.data[key].
 * @param {object | undefined} data
 * @param {string} key
 * @returns {number | null}
 */
export function getNumericValueFromData(data, key) {
  if (!data || typeof data !== 'object' || key == null) return null
  const raw = data[key]
  if (raw === null || raw === undefined) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}
