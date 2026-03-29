export function MetricSelector({ metrics, value, onChange, disabled, label = 'Metric' }) {
  if (!metrics?.length) {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
        <p className="text-sm text-slate-500">No metrics in telemetry yet.</p>
      </div>
    )
  }

  return (
    <div>
      <label htmlFor="metric-select" className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id="metric-select"
        disabled={disabled}
        className="input-box max-w-xs"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {metrics.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  )
}
