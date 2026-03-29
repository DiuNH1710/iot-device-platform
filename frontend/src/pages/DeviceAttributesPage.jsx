import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../services/api'
import { useAttributes } from '../hooks/useAttributes'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Modal } from '../components/Modal'
import { vi } from '../constants/i18n'

function getErrorMessage(err) {
  const d = err.response?.data
  if (typeof d?.detail === 'string') return d.detail
  return err.message || vi.errors.requestFailed
}

export function DeviceAttributesPage() {
  const { deviceId, isOwner } = useOutletContext()
  const { attributes, loading, error, refresh } = useAttributes(deviceId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editAttr, setEditAttr] = useState(null)
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const openCreate = () => {
    setEditAttr(null)
    setName('')
    setValue('')
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (attr) => {
    setEditAttr(attr)
    setName(attr.attribute_name)
    setValue(attr.attribute_value ?? '')
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      await api.post(`/devices/${deviceId}/attributes`, {
        attribute_name: name.trim(),
        attribute_value: value,
      })
      setModalOpen(false)
      refresh()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (attr) => {
    if (!window.confirm(vi.deviceAttributes.deleteConfirm(attr.attribute_name))) return
    setSubmitting(true)
    try {
      await api.delete(`/devices/${deviceId}/attributes/${attr.id}`)
      refresh()
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card
        title={vi.deviceAttributes.title}
        actions={
          isOwner ? (
            <Button type="button" onClick={openCreate}>
              {vi.deviceAttributes.add}
            </Button>
          ) : null
        }
      >
        <p className="mb-4 text-sm text-slate-600">{vi.deviceAttributes.intro}</p>

        {error && <p className="mb-4 text-sm text-red-600">{getErrorMessage(error)}</p>}
        {loading ? (
          <p className="text-slate-500">{vi.deviceAttributes.loading}</p>
        ) : attributes.length === 0 ? (
          <p className="text-sm text-slate-500">{vi.deviceAttributes.empty}</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">{vi.deviceAttributes.colName}</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">{vi.deviceAttributes.colValue}</th>
                  {isOwner && <th className="px-3 py-2 text-right font-medium text-slate-700">{vi.common.actions}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attributes.map((a) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2 font-medium text-slate-900">{a.attribute_name}</td>
                    <td className="max-w-md whitespace-pre-wrap break-words px-3 py-2 text-slate-800">
                      {a.attribute_value}
                    </td>
                    {isOwner && (
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <Button type="button" variant="secondary" className="!py-1 !text-xs" onClick={() => openEdit(a)}>
                          {vi.common.edit}
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="ml-2 !py-1 !text-xs"
                          onClick={() => handleDelete(a)}
                          disabled={submitting}
                        >
                          {vi.common.delete}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isOwner && <p className="mt-4 text-sm text-slate-500">{vi.deviceAttributes.readOnly}</p>}
      </Card>

      <Modal open={modalOpen} onClose={() => !submitting && setModalOpen(false)} title={editAttr ? vi.deviceAttributes.modalEdit : vi.deviceAttributes.modalAdd}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={vi.common.name}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!!editAttr}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{vi.common.value}</label>
            <textarea className="input-box min-h-[100px]" value={value} onChange={(e) => setValue(e.target.value)} required />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              {vi.common.cancel}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? vi.common.saving : vi.common.save}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
