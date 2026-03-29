/** @typedef {'1h' | '24h' | '7d' | 'all'} TimeRangePreset */

/**
 * @param {TimeRangePreset} preset
 * @returns {{ from_time?: string, to_time?: string }}
 */
export function presetToQueryParams(preset) {
  if (preset === 'all') return {}

  const now = new Date()
  const from = new Date(now)

  if (preset === '1h') from.setHours(from.getHours() - 1)
  else if (preset === '24h') from.setDate(from.getDate() - 1)
  else if (preset === '7d') from.setDate(from.getDate() - 7)

  return {
    from_time: from.toISOString(),
    to_time: now.toISOString(),
  }
}
