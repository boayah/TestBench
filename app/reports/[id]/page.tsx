'use client'

import { use } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import { downloadFile, testRunToMarkdown } from '@/lib/export'

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { state } = useStore()

  const testRun = state.testRuns.find(tr => tr.id === id)

  if (!testRun) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Report not found for run: {id}</div>
        <Link href="/reports" className="text-blue-600 hover:underline text-sm mt-2 block">Back to reports</Link>
      </div>
    )
  }

  const protocol = state.protocols.find(p => p.id === testRun.protocol_id)
  const fixture = state.fixtures.find(f => f.id === testRun.fixture_id)
  const linkedFailures = state.failures.filter(f => f.test_run_id === id)

  function handleExportMarkdown() {
    if (!testRun) return
    const md = testRunToMarkdown(testRun, protocol, fixture, linkedFailures)
    downloadFile(md, `${id}-report.md`, 'text/markdown')
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/reports" className="text-xs text-gray-400 hover:text-gray-600">Reports</Link>
          <span className="text-xs text-gray-300 mx-1">/</span>
          <span className="text-xs text-gray-500 font-mono">{id}</span>
          <h1 className="text-xl font-semibold text-gray-900 mt-2">Test Run Report</h1>
          <div className="text-sm text-gray-500 mt-1 font-mono">{id}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportMarkdown}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
          >
            Export Markdown
          </button>
          <Link
            href={`/test-runs/${id}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
          >
            Edit Run
          </Link>
        </div>
      </div>

      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
        Demo environment. This report is generated from local state and is not a controlled document.
        Production usage requires authentication, formal validation, and document control.
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Summary</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {[
              ['Protocol', protocol?.name ?? testRun.protocol_id],
              ['Revision', `Rev ${testRun.protocol_revision}`],
              ['Unit ID', testRun.unit_id],
              ['Operator', testRun.operator],
              ['Fixture', fixture?.name ?? testRun.fixture_id],
              ['Test Date', formatDate(testRun.date)],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-3">
                <span className="text-gray-500 w-24 shrink-0">{label}</span>
                <span className="text-gray-800 font-medium">{val}</span>
              </div>
            ))}
            <div className="flex gap-3 col-span-2">
              <span className="text-gray-500 w-24 shrink-0">Result</span>
              <StatusBadge value={testRun.result} size="md" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Measurements vs Acceptance Criteria</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">Parameter</th>
                <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">Spec (Min / Max)</th>
                <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">Measured</th>
                <th className="text-left py-2 text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {testRun.measurements.map(m => {
                const ac = protocol?.acceptance_criteria.find(c => c.id === m.criterion_id)
                const specStr = ac ? [
                  ac.min !== undefined ? ac.min : '-',
                  ac.max !== undefined ? ac.max : '-',
                ].join(' / ') : 'N/A'
                return (
                  <tr key={m.criterion_id} className={`border-b border-gray-50 ${!m.within_spec ? 'bg-red-50' : ''}`}>
                    <td className="py-2.5 pr-4 text-gray-800">{m.parameter}</td>
                    <td className="py-2.5 pr-4 text-gray-500 text-xs font-mono">
                      {specStr} {m.unit}
                    </td>
                    <td className="py-2.5 pr-4 font-mono font-semibold text-gray-900">
                      {m.value} {m.unit}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge value={m.within_spec} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {testRun.observations && (
          <div className="border-t border-gray-100 pt-5">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Observations</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{testRun.observations}</p>
          </div>
        )}

        {linkedFailures.length > 0 && (
          <div className="border-t border-gray-100 pt-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Linked Failures</h2>
            <div className="space-y-3">
              {linkedFailures.map(f => (
                <div key={f.id} className="border border-gray-100 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/failures/${f.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                      {f.id}
                    </Link>
                    <StatusBadge value={f.severity} />
                    <StatusBadge value={f.status} />
                  </div>
                  <div className="text-sm text-gray-800 font-medium">{f.failure_mode}</div>
                  {f.suspected_cause && (
                    <div className="text-xs text-gray-500 mt-1">Cause: {f.suspected_cause}</div>
                  )}
                  {f.corrective_action && (
                    <div className="text-xs text-gray-500 mt-0.5">Action: {f.corrective_action}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">Owner: {f.owner}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Review status:</span>
              <StatusBadge value={testRun.result} />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            TestBench Tracker - Demo Environment. Not a controlled document.
          </div>
        </div>
      </div>
    </div>
  )
}
