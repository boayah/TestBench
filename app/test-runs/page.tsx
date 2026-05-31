'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { TestResult } from '@/lib/types'

export default function TestRunsPage() {
  const { state } = useStore()
  const { testRuns, protocols, fixtures } = state

  const [protocolFilter, setProtocolFilter] = useState('')
  const [resultFilter, setResultFilter] = useState<TestResult | ''>('')
  const [fixtureFilter, setFixtureFilter] = useState('')
  const [operatorFilter, setOperatorFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const operators = [...new Set(testRuns.map(tr => tr.operator))].sort()

  const filtered = testRuns.filter(tr => {
    if (protocolFilter && tr.protocol_id !== protocolFilter) return false
    if (resultFilter && tr.result !== resultFilter) return false
    if (fixtureFilter && tr.fixture_id !== fixtureFilter) return false
    if (operatorFilter && tr.operator !== operatorFilter) return false
    if (dateFrom && tr.date < dateFrom) return false
    if (dateTo && tr.date > dateTo) return false
    return true
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const passRate = filtered.length > 0
    ? Math.round((filtered.filter(tr => tr.result === 'pass').length / filtered.length) * 100)
    : null

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Test Runs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} of {testRuns.length} runs
            {passRate !== null && <span> &mdash; {passRate}% pass rate</span>}
          </p>
        </div>
        <Link
          href="/test-runs/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          New Test Run
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Protocol</label>
              <select
                value={protocolFilter}
                onChange={e => setProtocolFilter(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All protocols</option>
                {protocols.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Result</label>
              <select
                value={resultFilter}
                onChange={e => setResultFilter(e.target.value as TestResult | '')}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All results</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="needs_review">Needs Review</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Operator</label>
              <select
                value={operatorFilter}
                onChange={e => setOperatorFilter(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All operators</option>
                {operators.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fixture</label>
              <select
                value={fixtureFilter}
                onChange={e => setFixtureFilter(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All fixtures</option>
                {fixtures.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          {(protocolFilter || resultFilter || fixtureFilter || operatorFilter || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setProtocolFilter(''); setResultFilter(''); setFixtureFilter('')
                setOperatorFilter(''); setDateFrom(''); setDateTo('')
              }}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Run ID</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Protocol</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Rev</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Unit ID</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Operator</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Fixture</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Date</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Result</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tr => {
              const proto = protocols.find(p => p.id === tr.protocol_id)
              const fix = fixtures.find(f => f.id === tr.fixture_id)
              return (
                <tr key={tr.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-2.5">
                    <Link href={`/test-runs/${tr.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                      {tr.id}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-xs max-w-[180px]">
                    <span className="block truncate text-gray-700">{proto?.name ?? tr.protocol_id}</span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 font-mono text-xs">Rev {tr.protocol_revision}</td>
                  <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">{tr.unit_id}</td>
                  <td className="px-3 py-2.5 text-gray-600 text-xs">{tr.operator}</td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">
                    <span className="block truncate max-w-[120px]">{fix?.name ?? tr.fixture_id}</span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{formatDate(tr.date)}</td>
                  <td className="px-3 py-2.5"><StatusBadge value={tr.result} /></td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-gray-400 text-sm">
                  No test runs match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
