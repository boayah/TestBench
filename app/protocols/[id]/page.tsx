'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate, nowISO } from '@/lib/utils'
import type { ProtocolStatus } from '@/lib/types'

export default function ProtocolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { state, dispatch } = useStore()
  const router = useRouter()

  const protocol = state.protocols.find(p => p.id === id)
  const [showReviseForm, setShowReviseForm] = useState(false)
  const [newRevision, setNewRevision] = useState('')
  const [revisionError, setRevisionError] = useState('')

  if (!protocol) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Protocol not found.</div>
        <Link href="/protocols" className="text-blue-600 hover:underline text-sm mt-2 block">Back to protocols</Link>
      </div>
    )
  }

  const testRuns = state.testRuns
    .filter(tr => tr.protocol_id === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const fixture = state.fixtures.find(f => f.id === protocol.fixture_required)

  function handleArchive() {
    if (!protocol) return
    dispatch({
      type: 'UPDATE_PROTOCOL',
      payload: { ...protocol, status: 'archived', updated_at: nowISO() },
    })
  }

  function handleActivate() {
    if (!protocol) return
    dispatch({
      type: 'UPDATE_PROTOCOL',
      payload: { ...protocol, status: 'active', updated_at: nowISO() },
    })
  }

  function handleRevise(e: React.FormEvent) {
    e.preventDefault()
    if (!protocol) return
    if (!newRevision.trim()) { setRevisionError('Revision label is required.'); return }
    dispatch({
      type: 'UPDATE_PROTOCOL',
      payload: { ...protocol, revision: newRevision.trim(), updated_at: nowISO() },
    })
    setShowReviseForm(false)
    setNewRevision('')
    setRevisionError('')
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/protocols" className="text-xs text-gray-400 hover:text-gray-600">Protocols</Link>
          <span className="text-xs text-gray-300 mx-1">/</span>
          <span className="text-xs text-gray-500">{protocol.id}</span>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">{protocol.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-500">Rev {protocol.revision}</span>
            <StatusBadge value={protocol.status} />
          </div>
        </div>
        <div className="flex gap-2">
          {protocol.status !== 'archived' && (
            <Link
              href={`/test-runs/new?protocol=${protocol.id}`}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Create Test Run
            </Link>
          )}
          <button
            onClick={() => setShowReviseForm(v => !v)}
            className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
          >
            Add Revision
          </button>
          {protocol.status === 'active' && (
            <button
              onClick={handleArchive}
              className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
            >
              Archive
            </button>
          )}
          {(protocol.status === 'draft' || protocol.status === 'archived') && (
            <button
              onClick={handleActivate}
              className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
            >
              Set Active
            </button>
          )}
        </div>
      </div>

      {showReviseForm && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <form onSubmit={handleRevise} className="flex items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">New Revision Label</label>
              <input
                type="text"
                value={newRevision}
                onChange={e => setNewRevision(e.target.value)}
                placeholder="e.g., C or 2.0"
                className="border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
                autoFocus
              />
              {revisionError && <div className="text-xs text-red-600 mt-1">{revisionError}</div>}
            </div>
            <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              Apply Revision
            </button>
            <button type="button" onClick={() => setShowReviseForm(false)} className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            This updates the revision label on the protocol. Existing test runs retain their recorded revision.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Protocol Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3">
              <span className="text-gray-500 w-32 shrink-0">Owner</span>
              <span className="text-gray-800">{protocol.owner}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-500 w-32 shrink-0">Revision</span>
              <span className="text-gray-800 font-mono">Rev {protocol.revision}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-500 w-32 shrink-0">Fixture Required</span>
              <span className="text-gray-800">
                {fixture ? (
                  <Link href={`/fixtures`} className="text-blue-600 hover:underline">{fixture.name}</Link>
                ) : (
                  protocol.fixture_required || 'Not specified'
                )}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-500 w-32 shrink-0">Created</span>
              <span className="text-gray-800">{formatDate(protocol.created_at)}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-500 w-32 shrink-0">Last Updated</span>
              <span className="text-gray-800">{formatDate(protocol.updated_at)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Equipment Required</h2>
          {protocol.equipment_required.length > 0 ? (
            <ul className="space-y-1.5">
              {protocol.equipment_required.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-gray-400 shrink-0">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-400">No equipment listed.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Acceptance Criteria</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Parameter</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Unit</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Min</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Max</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {protocol.acceptance_criteria.map(ac => (
              <tr key={ac.id} className="border-b border-gray-50">
                <td className="px-5 py-2.5 text-gray-800 font-medium">{ac.parameter}</td>
                <td className="px-3 py-2.5 text-gray-600">{ac.unit}</td>
                <td className="px-3 py-2.5 text-gray-600">{ac.min ?? '-'}</td>
                <td className="px-3 py-2.5 text-gray-600">{ac.max ?? '-'}</td>
                <td className="px-3 py-2.5 text-gray-600">{ac.nominal ?? '-'}</td>
              </tr>
            ))}
            {protocol.acceptance_criteria.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-4 text-center text-gray-400 text-sm">
                  No acceptance criteria defined.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Test Run History</h2>
          <span className="text-xs text-gray-400">{testRuns.length} run{testRuns.length !== 1 ? 's' : ''}</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Run ID</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Rev</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Unit ID</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Operator</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Date</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Result</th>
            </tr>
          </thead>
          <tbody>
            {testRuns.map(tr => (
              <tr key={tr.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-2.5">
                  <Link href={`/test-runs/${tr.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                    {tr.id}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-gray-500 font-mono text-xs">Rev {tr.protocol_revision}</td>
                <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">{tr.unit_id}</td>
                <td className="px-3 py-2.5 text-gray-600 text-xs">{tr.operator}</td>
                <td className="px-3 py-2.5 text-gray-500 text-xs">{formatDate(tr.date)}</td>
                <td className="px-3 py-2.5"><StatusBadge value={tr.result} /></td>
              </tr>
            ))}
            {testRuns.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-gray-400 text-sm">
                  No test runs yet for this protocol.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
