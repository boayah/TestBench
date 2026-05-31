'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { StatusBadge } from '@/components/StatusBadge'
import { StatCard } from '@/components/StatCard'
import { formatDate, isOverdue, isDueSoon, generateId, nowISO, today } from '@/lib/utils'
import type { FixtureStatus } from '@/lib/types'

interface FixtureForm {
  name: string
  type: string
  location: string
  status: FixtureStatus
  last_check_date: string
  next_check_date: string
  notes: string
}

function emptyForm(): FixtureForm {
  return { name: '', type: '', location: '', status: 'active', last_check_date: '', next_check_date: '', notes: '' }
}

export default function FixturesPage() {
  const { state, dispatch } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FixtureForm>(emptyForm())
  const [statusFilter, setStatusFilter] = useState<FixtureStatus | ''>('')
  const [formError, setFormError] = useState('')

  const { fixtures } = state

  const filtered = fixtures.filter(f => !statusFilter || f.status === statusFilter)

  const activeCount = fixtures.filter(f => f.status === 'active').length
  const overdueCount = fixtures.filter(f => f.status === 'active' && isOverdue(f.next_check_date)).length
  const dueSoonCount = fixtures.filter(f => f.status === 'active' && !isOverdue(f.next_check_date) && isDueSoon(f.next_check_date)).length

  function openCreate() {
    setForm(emptyForm())
    setEditId(null)
    setShowForm(true)
    setFormError('')
  }

  function openEdit(id: string) {
    const f = fixtures.find(x => x.id === id)
    if (!f) return
    setForm({
      name: f.name,
      type: f.type,
      location: f.location,
      status: f.status,
      last_check_date: f.last_check_date ?? '',
      next_check_date: f.next_check_date ?? '',
      notes: f.notes,
    })
    setEditId(id)
    setShowForm(true)
    setFormError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.type.trim()) {
      setFormError('Name and type are required.')
      return
    }
    setFormError('')
    const now = nowISO()
    if (editId) {
      dispatch({
        type: 'UPDATE_FIXTURE',
        payload: {
          ...(fixtures.find(f => f.id === editId)!),
          name: form.name.trim(),
          type: form.type.trim(),
          location: form.location.trim(),
          status: form.status,
          last_check_date: form.last_check_date || null,
          next_check_date: form.next_check_date || null,
          notes: form.notes.trim(),
          updated_at: now,
        },
      })
    } else {
      dispatch({
        type: 'ADD_FIXTURE',
        payload: {
          id: generateId('FIX'),
          name: form.name.trim(),
          type: form.type.trim(),
          location: form.location.trim(),
          status: form.status,
          last_check_date: form.last_check_date || null,
          next_check_date: form.next_check_date || null,
          notes: form.notes.trim(),
          created_at: now,
          updated_at: now,
        },
      })
    }
    setShowForm(false)
    setEditId(null)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Fixtures</h1>
          <p className="text-sm text-gray-500 mt-1">Test fixtures and calibrated equipment</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          Add Fixture
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Fixtures" value={fixtures.length} />
        <StatCard label="Active" value={activeCount} accent="blue" />
        <StatCard label="Due Soon" value={dueSoonCount} accent={dueSoonCount > 0 ? 'yellow' : 'default'} detail="within 30 days" />
        <StatCard label="Overdue" value={overdueCount} accent={overdueCount > 0 ? 'red' : 'default'} detail="past due date" />
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            {editId ? 'Edit Fixture' : 'Add Fixture'}
          </h2>
          {formError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">{formError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <input type="text" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  placeholder="e.g., Pressure Test"
                  className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g., Bay 1"
                  className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as FixtureStatus }))}
                  className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="under_maintenance">Under Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Check Date</label>
                <input type="date" value={form.last_check_date} onChange={e => setForm(f => ({ ...f, last_check_date: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Next Check Date</label>
                <input type="date" value={form.next_check_date} onChange={e => setForm(f => ({ ...f, next_check_date: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">
                {editId ? 'Save Changes' : 'Add Fixture'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }}
                className="px-4 py-2 text-gray-600 text-sm border border-gray-200 rounded hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as FixtureStatus | '')}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="under_maintenance">Under Maintenance</option>
            <option value="retired">Retired</option>
          </select>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">ID</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Name</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Type</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Location</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Last Check</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Next Check</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Status</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => {
              const overdue = f.status === 'active' && isOverdue(f.next_check_date)
              const dueSoon = f.status === 'active' && !overdue && isDueSoon(f.next_check_date)
              return (
                <tr key={f.id} className={`border-b border-gray-50 hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{f.id}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-gray-800">{f.name}</div>
                    {f.notes && <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{f.notes}</div>}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{f.type}</td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{f.location}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{formatDate(f.last_check_date ?? '')}</td>
                  <td className="px-3 py-3 text-xs">
                    <span className={overdue ? 'text-red-600 font-medium' : dueSoon ? 'text-yellow-600 font-medium' : 'text-gray-500'}>
                      {formatDate(f.next_check_date ?? '')}
                    </span>
                    {overdue && <span className="ml-1 text-xs text-red-500">(overdue)</span>}
                    {dueSoon && <span className="ml-1 text-xs text-yellow-500">(soon)</span>}
                  </td>
                  <td className="px-3 py-3"><StatusBadge value={f.status} /></td>
                  <td className="px-3 py-3">
                    <button onClick={() => openEdit(f.id)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-gray-400 text-sm">
                  No fixtures found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
