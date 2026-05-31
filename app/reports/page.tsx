'use client'

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import { downloadFile, testRunsToCSV, failuresToCSV } from '@/lib/export'

export default function ReportsPage() {
  const { state } = useStore()
  const { testRuns, protocols, fixtures, failures } = state

  const sorted = [...testRuns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  function handleExportTestRunsCSV() {
    downloadFile(testRunsToCSV(testRuns, protocols, fixtures), 'test-runs.csv', 'text/csv')
  }

  function handleExportFailuresCSV() {
    downloadFile(failuresToCSV(failures), 'failures.csv', 'text/csv')
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">View and export test run reports</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportTestRunsCSV}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
          >
            Export Test Runs CSV
          </button>
          <button
            onClick={handleExportFailuresCSV}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
          >
            Export Failures CSV
          </button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
        <span className="font-semibold">Demo environment.</span> This tool is for demonstration purposes only.
        Production usage requires authentication, formal validation, access control, and controlled document management
        per applicable quality and regulatory standards (e.g., ISO 9001, 21 CFR Part 11).
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">All Test Runs</h2>
          <p className="text-xs text-gray-400 mt-0.5">Click a run ID to view the full report.</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Run ID</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Protocol</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Rev</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Unit ID</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Operator</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Date</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Result</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Failures</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(tr => {
              const proto = protocols.find(p => p.id === tr.protocol_id)
              const trFailures = failures.filter(f => f.test_run_id === tr.id)
              const openF = trFailures.filter(f => f.status === 'open' || f.status === 'in_progress').length
              return (
                <tr key={tr.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-2.5">
                    <Link href={`/reports/${tr.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                      {tr.id}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-xs max-w-[180px]">
                    <span className="block truncate text-gray-700">{proto?.name ?? tr.protocol_id}</span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 font-mono text-xs">Rev {tr.protocol_revision}</td>
                  <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">{tr.unit_id}</td>
                  <td className="px-3 py-2.5 text-gray-600 text-xs">{tr.operator}</td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{formatDate(tr.date)}</td>
                  <td className="px-3 py-2.5"><StatusBadge value={tr.result} /></td>
                  <td className="px-3 py-2.5">
                    {trFailures.length > 0 ? (
                      <span className={`text-xs font-medium ${openF > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {trFailures.length} ({openF} open)
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/reports/${tr.id}`} className="text-xs text-gray-400 hover:text-blue-600">
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-gray-400 text-sm">
                  No test runs available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
