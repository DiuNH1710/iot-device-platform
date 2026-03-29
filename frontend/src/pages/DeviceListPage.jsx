import { useState } from 'react'
import api from '../services/api'
import { useDevices } from '../hooks/useDevices'
import { DeviceCard } from '../components/DeviceCard'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Modal } from '../components/Modal'
import { Card } from '../components/Card'

function getErrorMessage(err) {
  const d = err.response?.data
  if (typeof d?.detail === 'string') return d.detail
  if (Array.isArray(d?.detail)) return d.detail.map((x) => x.msg || x).join(', ')
  return err.message || 'Request failed'
}

export function DeviceListPage() {
  const { devices, loading, error, refresh } = useDevices()
  const { userId } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [imei, setImei] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      await api.post('/devices', {
        imei,
        name,
        description: description || null,
      })
      setModalOpen(false)
      setImei('')
      setName('')
      setDescription('')
      refresh()
    } catch (err) {
      setSubmitError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Devices</h1>
          <p className="mt-1 text-slate-600">Register and manage your IoT devices.</p>
        </div>
        <Button type="button" onClick={() => setModalOpen(true)}>
          Add device
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {getErrorMessage(error)}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : devices.length === 0 ? (
        <Card>
          <p className="text-slate-600">No devices yet. Create one to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {devices.map((d) => (
            <DeviceCard key={d.id} device={d} showOwnerHint ownerId={userId} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => !submitting && setModalOpen(false)} title="Add device" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="IMEI" required value={imei} onChange={(e) => setImei(e.target.value)} placeholder="Unique device IMEI" />
          <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description (optional)</label>
            <textarea
              className="input-box min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
