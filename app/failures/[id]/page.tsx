'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate, nowISO } from '@/lib/utils'
import type { FailureSeverity, FailureStatus, FailureDisposition } from '@/lib/types'

export default function FailureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { state, dispatch } = useStore()

  const failure = state.failures.find(f => f.id === id)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    failure_mode: '',
    severity: 'major' as FailureSeverity,
    status: 'open' as FailureStatus,
    disposition: 'pending' as FailureDisposition,
    suspected_cause: '',
    corrective_action: '',
    owner: '',
    closed_date: '',
  })

  if (!failure) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Failure record not found.</div>
        <Link href="/failures" className="text-blue-600 hover:underline text-sm mt-2 block">Back to failure log</Link>
      </div>
    )
  }

  const testRun = state.testRuns.find(tr => tr.id === failure.test_run_id)
  const protocol = testRun ? state.protocols.find(p => p.id === testRun.protocol_id) : undefined

  const repeatCount = state.failures.filter(f => f.failure_mode === failure.failure_mode).length

  function startEdit() {
    if (!failure) return
    setForm({
      failure_mode: failure.failure_mode,
      severity: failure.severity,
      status: failure.status,
      disposition: failure.disposition,
      suspected_cause: failure.suspected_cause,
      corrective_action: failure.corrective_action,
      owner: failure.owner,
      closed_date: failure.closed_date ?? '',
    })
    setEditing(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!failure) return
    dispatch({
      type: 'UPDATE_FAILURE',
      payload: {
        ...failure,
        failure_mode: form.failure_mode.trim(),
        severity: form.severity,
        status: form.status,
        disposition: form.disposition,
        suspected_cause: form.suspected_cause.trim(),
        corrective_action: form.corrective_action.trim(),
        owner: form.owner.trim(),
        closed_date: form.closed_date || null,
        updated_at: nowISO(),
      },
    })
    setEditing(false)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/failures" className="text-xs text-gray-400 hover:text-gray-600">Failures</Link>
          <span className="text-xs text-gray-300 mx-1">/</span>
          <span className="text-xs text-gray-500 font-mono">{id}</span>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-xl font-semibold text-gray-900 font-mono">{id}</h1>
            <StatusBadge value={failure.severity} size="md" />
            <StatusBadge value={failure.status} size="md" />
          </div>
          {repeatCount > 1 && (
            <div className="mt-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded inline-block">
              This failure mode has occurred {repeatCount} times.
            </div>
          )}
        </div>
        {!editing && (
          <button
            onClick={startEdit}
            className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Failure Mode</label>
            <input type="text" value={form.failure_mode} onChange={e => setForm(f => ({ ...f, failure_mode: e.target.value }))}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
              <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as FailureSeverity }))}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="critical">Critical</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as FailureStatus }))}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Disposition</label>
              <select value={form.disposition} onChange={e => setForm(f => ({ ...f, disposition: e.target.value as FailureDisposition }))}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="pending">Pending</option>
                <option value="rework">Rework</option>
                <option value="scrap">Scrap</option>
                <option value="use_as_is">Use As-Is</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Owner</label>
            <input type="text" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Suspected Cause</label>
            <textarea value={form.suspected_cause} onChange={e => setForm(f => ({ ...f, suspected_cause: e.target.value }))}
              rows={2} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Corrective Action</label>
            <textarea value={form.corrective_action} onChange={e => setForm(f => ({ ...f, corrective_action: e.target.value }))}
              rows={2} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
          </div>
          {(form.status === 'closed' || form.status === 'cancelled') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Closed Date</label>
              <input type="date" value={form.closed_date} onChange={e => setForm(f => ({ ...f, closed_date: e.target.value }))}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">
              Save Changes
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-gray-600 text-sm border border-gray-200 rounded hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Failure Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Failure Mode</span>
                <p className="mt-1 text-gray-900 font-medium">{failure.failure_mode}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <span className="text-xs text-gray-500">Severity</span>
                  <div className="mt-1"><StatusBadge value={failure.severity} /></div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Status</span>
                  <div className="mt-1"><StatusBadge value={failure.status} /></div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Disposition</span>
                  <div className="mt-1"><StatusBadge value={failure.disposition} /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-xs text-gray-500">Owner</span>
                  <p className="mt-1 text-gray-800">{failure.owner}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Opened</span>
                  <p className="mt-1 text-gray-800">{formatDate(failure.opened_date)}</p>
                </div>
                {failure.closed_date && (
                  <div>
                    <span className="text-xs text-gray-500">Closed</span>
                    <p className="mt-1 text-gray-800">{formatDate(failure.closed_date)}</p>
                  </div>
                )}
              </div>
              <div className="pt-2 space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Suspected Cause</span>
                  <p className="mt-1 text-gray-700 leading-relaxed">{failure.suspected_cause || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Corrective Action</span>
                  <p className="mt-1 text-gray-700 leading-relaxed">{failure.corrective_action || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Linked Test Run</h2>
            {testRun ? (
              <div className="space-y-2 text-sm">
                <div className="flex gap-3">
                  <span className="text-gray-500 w-24 shrink-0">Run ID</span>
                  <Link href={`/test-runs/${testRun.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                    {testRun.id}
                  </Link>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 w-24 shrink-0">Protocol</span>
                  <span className="text-gray-800">{protocol?.name ?? testRun.protocol_id}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 w-24 shrink-0">Unit ID</span>
                  <span className="text-gray-800 font-mono text-xs">{testRun.unit_id}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 w-24 shrink-0">Date</span>
                  <span className="text-gray-800">{formatDate(testRun.date)}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 w-24 shrink-0">Result</span>
                  <StatusBadge value={testRun.result} />
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">Test run not found: {failure.test_run_id}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
