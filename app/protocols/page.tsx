'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { ProtocolStatus } from '@/lib/types'

export default function ProtocolsPage() {
  const { state } = useStore()
  const [statusFilter, setStatusFilter] = useState<ProtocolStatus | ''>('')
  const [search, setSearch] = useState('')

  const filtered = state.protocols.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.owner.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Test Protocols</h1>
          <p className="text-sm text-gray-500 mt-1">{state.protocols.length} protocols on file</p>
        </div>
        <Link
          href="/protocols/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          New Protocol
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search by name or owner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ProtocolStatus | '')}
            className="text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Protocol</th>
              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">Rev</th>
              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">Owner</th>
              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">Fixture Required</th>
              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">Criteria</th>
              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">Updated</th>
              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const fixture = state.fixtures.find(f => f.id === p.fixture_required)
              const runCount = state.testRuns.filter(tr => tr.protocol_id === p.id).length
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link href={`/protocols/${p.id}`} className="font-medium text-blue-600 hover:underline">
                      {p.name}
                    </Link>
                    <div className="text-xs text-gray-400 mt-0.5">{runCount} run{runCount !== 1 ? 's' : ''}</div>
                  </td>
                  <td className="px-3 py-3 text-gray-700 font-mono text-xs">Rev {p.revision}</td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{p.owner}</td>
                  <td className="px-3 py-3 text-gray-600 text-xs">
                    {fixture ? fixture.name : p.fixture_required}
                  </td>
                  <td className="px-3 py-3 text-gray-500 text-xs">{p.acceptance_criteria.length}</td>
                  <td className="px-3 py-3 text-gray-400 text-xs">{formatDate(p.updated_at)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge value={p.status} />
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">
                  No protocols match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
