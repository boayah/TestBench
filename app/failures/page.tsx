'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { StatusBadge } from '@/components/StatusBadge'
import { StatCard } from '@/components/StatCard'
import { ParetoChart } from '@/components/ParetoChart'
import { formatDate } from '@/lib/utils'
import { downloadFile, failuresToCSV } from '@/lib/export'
import type { FailureSeverity, FailureStatus } from '@/lib/types'

export default function FailuresPage() {
  const { state } = useStore()
  const { failures, testRuns } = state

  const [severityFilter, setSeverityFilter] = useState<FailureSeverity | ''>('')
  const [statusFilter, setStatusFilter] = useState<FailureStatus | ''>('')

  const filtered = failures.filter(f => {
    if (severityFilter && f.severity !== severityFilter) return false
    if (statusFilter && f.status !== statusFilter) return false
    return true
  }).sort((a, b) => new Date(b.opened_date).getTime() - new Date(a.opened_date).getTime())

  const openCount = failures.filter(f => f.status === 'open').length
  const inProgressCount = failures.filter(f => f.status === 'in_progress').length
  const closedCount = failures.filter(f => f.status === 'closed').length
  const criticalCount = failures.filter(f => f.severity === 'critical' && (f.status === 'open' || f.status === 'in_progress')).length

  const modeCounts = failures.reduce<Record<string, number>>((acc, f) => {
    acc[f.failure_mode] = (acc[f.failure_mode] ?? 0) + 1
    return acc
  }, {})
  const paretoData = Object.entries(modeCounts).map(([label, count]) => ({ label, count }))

  const repeatModes = new Set(
    Object.entries(modeCounts).filter(([, c]) => c > 1).map(([m]) => m)
  )

  function handleExportCSV() {
    downloadFile(failuresToCSV(failures), 'failures.csv', 'text/csv')
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Failure Log</h1>
          <p className="text-sm text-gray-500 mt-1">{failures.length} total failures on record</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Open" value={openCount} accent={openCount > 0 ? 'red' : 'default'} />
        <StatCard label="In Progress" value={inProgressCount} accent={inProgressCount > 0 ? 'blue' : 'default'} />
        <StatCard label="Closed" value={closedCount} accent="green" />
        <StatCard
          label="Critical Open"
          value={criticalCount}
          accent={criticalCount > 0 ? 'red' : 'default'}
          detail="requires immediate action"
        />
      </div>

      {paretoData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Failure Mode Frequency</h2>
          <ParetoChart data={paretoData} />
          {repeatModes.size > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <span className="font-medium">Repeat failure modes detected ({repeatModes.size}):</span>{' '}
              {[...repeatModes].join('; ')}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value as FailureSeverity | '')}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All severities</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as FailureStatus | '')}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {(severityFilter || statusFilter) && (
            <button onClick={() => { setSeverityFilter(''); setStatusFilter('') }} className="text-xs text-blue-600 hover:underline">
              Clear
            </button>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">ID</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Failure Mode</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Test Run</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Severity</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Status</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Owner</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Opened</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <Link href={`/failures/${f.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                    {f.id}
                  </Link>
                </td>
                <td className="px-3 py-3 max-w-xs">
                  <div className="text-gray-800 text-xs">
                    {f.failure_mode}
                    {repeatModes.has(f.failure_mode) && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Repeat</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Link href={`/test-runs/${f.test_run_id}`} className="text-blue-600 hover:underline font-mono text-xs">
                    {f.test_run_id}
                  </Link>
                </td>
                <td className="px-3 py-3"><StatusBadge value={f.severity} /></td>
                <td className="px-3 py-3"><StatusBadge value={f.status} /></td>
                <td className="px-3 py-3 text-gray-600 text-xs">{f.owner}</td>
                <td className="px-3 py-3 text-gray-500 text-xs">{formatDate(f.opened_date)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">
                  No failures match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
