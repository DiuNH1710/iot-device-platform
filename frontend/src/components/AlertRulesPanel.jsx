import { useState } from 'react'
import api from '../services/api'
import { Button } from './Button'
import { Input } from './Input'
import { Modal } from './Modal'
import { AlertForm } from './AlertForm'

function getErrorMessage(err) {
  const d = err.response?.data
  if (typeof d?.detail === 'string') return d.detail
  if (Array.isArray(d?.detail)) return d.detail.map((x) => x.msg || x).join(', ')
  return err.message || 'Request failed'
}

const CONDITIONS = [
  { value: '>', label: '> (greater)' },
  { value: '<', label: '< (less)' },
  { value: '>=', label: '>= (greater or equal)' },
  { value: '<=', label: '<= (less or equal)' },
  { value: '==', label: '= (equal)' },
]

/**
 * @param {object} props
 * @param {boolean} props.isOwner
 * @param {number} props.deviceId
 * @param {string[]} props.metricOptions
 * @param {Array} props.rules
 * @param {boolean} props.loading
 * @param {() => void} props.onRefresh
 */
export function AlertRulesPanel({ isOwner, deviceId, metricOptions, rules, loading, onRefresh }) {
  const [editRule, setEditRule] = useState(null)
  const [saving, setSaving] = useState(false)

  const toggleEnabled = async (rule) => {
    setSaving(true)
    try {
      await api.patch(`/alert-rules/rules/${rule.id}`, { enabled: !rule.enabled })
      onRefresh?.()
    } catch (e) {
      alert(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editRule) return
    const fd = new FormData(e.target)
    const threshold = parseFloat(fd.get('threshold'), 10)
    if (Number.isNaN(threshold)) return
    setSaving(true)
    try {
      await api.patch(`/alert-rules/rules/${editRule.id}`, {
        metric_name: fd.get('metric_name'),
        condition: fd.get('condition'),
        threshold,
        message: fd.get('message'),
      })
      setEditRule(null)
      onRefresh?.()
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {loading ? (
        <p className="text-slate-500">Loading rules…</p>
      ) : rules.length === 0 ? (
        <p className="mb-4 text-sm text-slate-500">No alert rules for this device.</p>
      ) : (
        <ul className="mb-6 space-y-2">
          {rules.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm"
            >
              <div>
                <span className="font-medium text-slate-800">
                  {r.metric_name} {r.condition === '==' ? '=' : r.condition} {r.threshold}
                </span>
                <p className="mt-1 text-xs text-slate-500">{r.message}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {r.enabled ? 'Enabled' : 'Disabled'}
                </span>
                {isOwner && (
                  <>
                    <Button type="button" variant="secondary" disabled={saving} onClick={() => toggleEnabled(r)}>
                      {r.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button type="button" variant="secondary" disabled={saving} onClick={() => setEditRule(r)}>
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOwner && (
        <div className="border-t border-slate-100 pt-6">
          <h4 className="mb-4 text-sm font-semibold text-slate-900">Create rule</h4>
          <AlertForm
            metricOptions={metricOptions}
            onSubmit={async (payload) => {
              setSaving(true)
              try {
                await api.post('/alert-rules/', {
                  device_id: Number(deviceId),
                  metric_name: payload.metric_name,
                  condition: payload.condition,
                  threshold: payload.threshold,
                  message: payload.message,
                })
                onRefresh?.()
              } catch (err) {
                alert(getErrorMessage(err))
              } finally {
                setSaving(false)
              }
            }}
            submitting={saving}
          />
        </div>
      )}

      {!isOwner && <p className="text-sm text-slate-500">Viewers can see rules but cannot change them.</p>}

      <Modal open={!!editRule} onClose={() => setEditRule(null)} title="Edit alert rule" size="lg">
        {editRule && (
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Metric</label>
              <select name="metric_name" className="input-box" defaultValue={editRule.metric_name} required>
                {(metricOptions?.length ? metricOptions : [editRule.metric_name]).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Condition</label>
              <select name="condition" className="input-box" defaultValue={editRule.condition} required>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Threshold" name="threshold" type="number" step="any" required defaultValue={editRule.threshold} />
            <Input label="Message" name="message" type="text" defaultValue={editRule.message} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditRule(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
