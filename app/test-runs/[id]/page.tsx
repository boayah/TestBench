'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate, nowISO } from '@/lib/utils'
import { downloadFile, testRunToMarkdown } from '@/lib/export'
import type { TestResult } from '@/lib/types'

export default function TestRunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { state, dispatch } = useStore()
  const router = useRouter()

  const testRun = state.testRuns.find(tr => tr.id === id)
  const [editResult, setEditResult] = useState(false)
  const [newResult, setNewResult] = useState<TestResult>('pass')
  const [newObs, setNewObs] = useState('')
  const [showAddFailure, setShowAddFailure] = useState(false)

  const [fMode, setFMode] = useState('')
  const [fSeverity, setFSeverity] = useState<'critical' | 'major' | 'minor'>('major')
  const [fCause, setFCause] = useState('')
  const [fDisposition, setFDisposition] = useState<'scrap' | 'rework' | 'use_as_is' | 'pending'>('pending')
  const [fAction, setFAction] = useState('')
  const [fOwner, setFOwner] = useState('')

  if (!testRun) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Test run not found.</div>
        <Link href="/test-runs" className="text-blue-600 hover:underline text-sm mt-2 block">Back to test runs</Link>
      </div>
    )
  }

  const protocol = state.protocols.find(p => p.id === testRun.protocol_id)
  const fixture = state.fixtures.find(f => f.id === testRun.fixture_id)
  const linkedFailures = state.failures.filter(f => f.test_run_id === id)

  function handleSaveResult(e: React.FormEvent) {
    e.preventDefault()
    if (!testRun) return
    dispatch({
      type: 'UPDATE_TEST_RUN',
      payload: { ...testRun, result: newResult, observations: newObs, updated_at: nowISO() },
    })
    setEditResult(false)
  }

  function handleAddFailure(e: React.FormEvent) {
    e.preventDefault()
    if (!testRun || !fMode.trim() || !fOwner.trim()) return
    const now = nowISO()
    dispatch({
      type: 'ADD_FAILURE',
      payload: {
        id: `FAI-${Date.now().toString(36).toUpperCase()}`,
        test_run_id: id,
        failure_mode: fMode.trim(),
        severity: fSeverity,
        suspected_cause: fCause.trim(),
        disposition: fDisposition,
        corrective_action: fAction.trim(),
        owner: fOwner.trim(),
        status: 'open',
        opened_date: testRun.date,
        closed_date: null,
        created_at: now,
        updated_at: now,
      },
    })
    setShowAddFailure(false)
    setFMode(''); setFCause(''); setFAction(''); setFOwner('')
  }

  function handleExportMarkdown() {
    if (!testRun) return
    const md = testRunToMarkdown(testRun, protocol, fixture, linkedFailures)
    downloadFile(md, `${testRun.id}-report.md`, 'text/markdown')
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/test-runs" className="text-xs text-gray-400 hover:text-gray-600">Test Runs</Link>
          <span className="text-xs text-gray-300 mx-1">/</span>
          <span className="text-xs text-gray-500 font-mono">{id}</span>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-semibold text-gray-900 font-mono">{id}</h1>
            <StatusBadge value={testRun.result} size="md" />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {protocol?.name ?? testRun.protocol_id} - Rev {testRun.protocol_revision}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportMarkdown}
            className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
          >
            Export Markdown
          </button>
          <Link
            href={`/reports/${id}`}
            className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
          >
            View Report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Run Information</h2>
          {[
            ['Unit ID', testRun.unit_id],
            ['Operator', testRun.operator],
            ['Fixture', fixture?.name ?? testRun.fixture_id],
            ['Date', formatDate(testRun.date)],
            ['Protocol Rev', `Rev ${testRun.protocol_revision}`],
          ].map(([label, val]) => (
            <div key={label} className="flex gap-3 text-sm">
              <span className="text-gray-500 w-28 shrink-0">{label}</span>
              <span className="text-gray-800">{val}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Result</h2>
            <button
              onClick={() => { setEditResult(true); setNewResult(testRun.result); setNewObs(testRun.observations) }}
              className="text-xs text-blue-600 hover:underline"
            >
              Edit
            </button>
          </div>
          {editResult ? (
            <form onSubmit={handleSaveResult} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Result</label>
                <select
                  value={newResult}
                  onChange={e => setNewResult(e.target.value as TestResult)}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                  <option value="needs_review">Needs Review</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Observations</label>
                <textarea
                  value={newObs}
                  onChange={e => setNewObs(e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                  Save
                </button>
                <button type="button" onClick={() => setEditResult(false)} className="text-xs text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <StatusBadge value={testRun.result} size="md" />
              {testRun.observations ? (
                <p className="text-sm text-gray-700 mt-3 leading-relaxed">{testRun.observations}</p>
              ) : (
                <p className="text-sm text-gray-400 mt-3">No observations recorded.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Measurements</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Parameter</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Measured</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Unit</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Spec</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {testRun.measurements.map(m => {
              const ac = protocol?.acceptance_criteria.find(c => c.id === m.criterion_id)
              const specParts = ac ? [
                ac.min !== undefined ? `>= ${ac.min}` : '',
                ac.max !== undefined ? `<= ${ac.max}` : '',
              ].filter(Boolean).join(', ') : 'N/A'
              return (
                <tr key={m.criterion_id} className={`border-b border-gray-50 ${!m.within_spec ? 'bg-red-50' : ''}`}>
                  <td className="px-5 py-2.5 text-gray-800 font-medium">{m.parameter}</td>
                  <td className="px-3 py-2.5 text-gray-900 font-mono font-semibold">{m.value}</td>
                  <td className="px-3 py-2.5 text-gray-500">{m.unit}</td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs font-mono">{specParts}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge value={m.within_spec} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">
            Linked Failures
            {linkedFailures.length > 0 && (
              <span className="ml-2 text-gray-400 font-normal">({linkedFailures.length})</span>
            )}
          </h2>
          <button
            onClick={() => setShowAddFailure(v => !v)}
            className="text-xs text-blue-600 hover:underline"
          >
            + Log Failure
          </button>
        </div>

        {showAddFailure && (
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <form onSubmit={handleAddFailure} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Failure Mode</label>
                  <input
                    type="text"
                    value={fMode}
                    onChange={e => setFMode(e.target.value)}
                    placeholder="Describe the failure mode"
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
                  <select
                    value={fSeverity}
                    onChange={e => setFSeverity(e.target.value as 'critical' | 'major' | 'minor')}
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Disposition</label>
                  <select
                    value={fDisposition}
                    onChange={e => setFDisposition(e.target.value as 'scrap' | 'rework' | 'use_as_is' | 'pending')}
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="rework">Rework</option>
                    <option value="scrap">Scrap</option>
                    <option value="use_as_is">Use As-Is</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Owner</label>
                  <input
                    type="text"
                    value={fOwner}
                    onChange={e => setFOwner(e.target.value)}
                    placeholder="e.g., D. Kim"
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Suspected Cause</label>
                  <input
                    type="text"
                    value={fCause}
                    onChange={e => setFCause(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Corrective Action</label>
                  <input
                    type="text"
                    value={fAction}
                    onChange={e => setFAction(e.target.value)}
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                  Log Failure
                </button>
                <button type="button" onClick={() => setShowAddFailure(false)} className="text-xs text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {linkedFailures.map(f => (
            <div key={f.id} className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/failures/${f.id}`} className="text-xs font-mono text-blue-600 hover:underline">
                    {f.id}
                  </Link>
                  <StatusBadge value={f.severity} />
                  <StatusBadge value={f.status} />
                </div>
                <span className="text-xs text-gray-400">{f.owner}</span>
              </div>
              <div className="text-sm text-gray-700 mt-2">{f.failure_mode}</div>
              {f.suspected_cause && (
                <div className="text-xs text-gray-500 mt-1">Cause: {f.suspected_cause}</div>
              )}
            </div>
          ))}
          {linkedFailures.length === 0 && !showAddFailure && (
            <div className="px-5 py-5 text-sm text-gray-400">No failures linked to this test run.</div>
          )}
        </div>
      </div>
    </div>
  )
}
