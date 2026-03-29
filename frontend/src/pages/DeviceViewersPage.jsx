import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useViewers } from '../hooks/useViewers'
import { useUsers } from '../hooks/useUsers'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

function getErrorMessage(err) {
  const d = err.response?.data
  if (typeof d?.detail === 'string') return d.detail
  return err.message || 'Request failed'
}

export function DeviceViewersPage() {
  const { deviceId, device, isOwner } = useOutletContext()
  const { userId } = useAuth()
  const { viewers, loading, error, refresh } = useViewers(deviceId)
  const { users, loading: usersLoading } = useUsers()

  const [selectedUserId, setSelectedUserId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const ownerId = device?.owner_id

  const candidateUsers = useMemo(() => {
    const viewerIds = new Set(viewers.map((v) => v.user_id))
    return users.filter(
      (u) => u.id !== ownerId && u.id !== userId && !viewerIds.has(u.id)
    )
  }, [users, viewers, ownerId, userId])

  const addViewer = async (e) => {
    e.preventDefault()
    const uid = parseInt(selectedUserId, 10)
    if (Number.isNaN(uid)) return
    setSubmitting(true)
    try {
      await api.post(`/devices/${deviceId}/viewers`, null, {
        params: { user_id: uid },
      })
      setSelectedUserId('')
      refresh()
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const removeViewer = async (viewerUserId) => {
    if (!window.confirm('Remove this viewer?')) return
    setSubmitting(true)
    try {
      await api.delete(`/devices/${deviceId}/viewers/${viewerUserId}`)
      refresh()
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card title="Shared access">
      <p className="mb-4 text-sm text-slate-600">
        Viewers can read telemetry, attributes, and alerts but cannot change device settings or rules.
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{getErrorMessage(error)}</p>}

      {loading ? (
        <p className="text-slate-500">Loading viewers…</p>
      ) : viewers.length === 0 ? (
        <p className="mb-6 text-sm text-slate-500">No viewers yet.</p>
      ) : (
        <ul className="mb-6 space-y-2">
          {viewers.map((v) => (
            <li
              key={v.user_id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-slate-900">{v.username}</span>
                <span className="ml-2 text-slate-500">user #{v.user_id}</span>
              </div>
              {isOwner && (
                <Button
                  type="button"
                  variant="danger"
                  className="!py-1 !text-xs"
                  disabled={submitting}
                  onClick={() => removeViewer(v.user_id)}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOwner ? (
        <form onSubmit={addViewer} className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-6">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">Add viewer by user</label>
            <select
              className="input-box"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={usersLoading || !candidateUsers.length}
            >
              <option value="">Select user…</option>
              {candidateUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} (#{u.id})
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={submitting || !selectedUserId}>
            Add viewer
          </Button>
        </form>
      ) : (
        <p className="text-sm text-slate-500">Only the device owner can manage viewers.</p>
      )}

      {isOwner && !usersLoading && candidateUsers.length === 0 && users.length > 0 && (
        <p className="mt-2 text-xs text-amber-700">No eligible users to add (all users are already viewers or the owner).</p>
      )}
    </Card>
  )
}
