'use client'

import Link from 'next/link'
import { useStore } from '@/lib/store'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate, isOverdue, isDueSoon } from '@/lib/utils'

export default function DashboardPage() {
  const { state } = useStore()
  const { protocols, testRuns, fixtures, failures } = state

  const activeProtocols = protocols.filter(p => p.status === 'active').length

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const runsThisMonth = testRuns.filter(tr => new Date(tr.date) >= monthStart).length

  const openFailures = failures.filter(f => f.status === 'open' || f.status === 'in_progress').length
  const criticalOpen = failures.filter(
    f => f.severity === 'critical' && (f.status === 'open' || f.status === 'in_progress')
  ).length

  const overdueFixtures = fixtures.filter(f => f.status === 'active' && isOverdue(f.next_check_date))
  const dueSoonFixtures = fixtures.filter(
    f => f.status === 'active' && !isOverdue(f.next_check_date) && isDueSoon(f.next_check_date)
  )

  const recentRuns = [...testRuns]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Test operations overview</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Protocols"
          value={activeProtocols}
          detail={`${protocols.length} total`}
          accent="blue"
        />
        <StatCard
          label="Runs This Month"
          value={runsThisMonth}
          detail={`${testRuns.length} all time`}
        />
        <StatCard
          label="Open Failures"
          value={openFailures}
          detail={criticalOpen > 0 ? `${criticalOpen} critical` : 'none critical'}
          accent={openFailures > 0 ? 'red' : 'default'}
        />
        <StatCard
          label="Fixtures Due"
          value={overdueFixtures.length + dueSoonFixtures.length}
          detail={overdueFixtures.length > 0 ? `${overdueFixtures.length} overdue` : 'none overdue'}
          accent={overdueFixtures.length > 0 ? 'red' : dueSoonFixtures.length > 0 ? 'yellow' : 'default'}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Recent Test Runs</h2>
              <Link href="/test-runs" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">ID</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Protocol</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Unit ID</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Operator</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Date</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Result</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map(tr => {
                  const proto = protocols.find(p => p.id === tr.protocol_id)
                  return (
                    <tr key={tr.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-2.5">
                        <Link href={`/test-runs/${tr.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                          {tr.id}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 max-w-xs truncate">
                        <span className="block max-w-[160px] truncate">{proto?.name ?? tr.protocol_id}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">{tr.unit_id}</td>
                      <td className="px-3 py-2.5 text-gray-600 text-xs">{tr.operator}</td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs">{formatDate(tr.date)}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge value={tr.result} />
                      </td>
                    </tr>
                  )
                })}
                {recentRuns.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-center text-gray-400 text-sm">
                      No test runs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Fixture Alerts</h2>
              <Link href="/fixtures" className="text-xs text-blue-600 hover:underline">Manage</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {overdueFixtures.map(f => (
                <div key={f.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{f.name}</div>
                      <div className="text-xs text-gray-500">{f.location}</div>
                    </div>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium shrink-0">
                      Overdue
                    </span>
                  </div>
                  <div className="text-xs text-red-600 mt-1">Due: {formatDate(f.next_check_date ?? '')}</div>
                </div>
              ))}
              {dueSoonFixtures.map(f => (
                <div key={f.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{f.name}</div>
                      <div className="text-xs text-gray-500">{f.location}</div>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium shrink-0">
                      Due Soon
                    </span>
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">Due: {formatDate(f.next_check_date ?? '')}</div>
                </div>
              ))}
              {overdueFixtures.length === 0 && dueSoonFixtures.length === 0 && (
                <div className="px-5 py-4 text-sm text-gray-400">All fixtures are current.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Open Failures</h2>
              <Link href="/failures" className="text-xs text-blue-600 hover:underline">View log</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {failures
                .filter(f => f.status === 'open' || f.status === 'in_progress')
                .slice(0, 5)
                .map(f => (
                  <div key={f.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/failures/${f.id}`} className="text-xs font-mono text-blue-600 hover:underline shrink-0">
                        {f.id}
                      </Link>
                      <StatusBadge value={f.severity} />
                    </div>
                    <div className="text-xs text-gray-700 mt-1 line-clamp-2">{f.failure_mode}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{f.owner}</div>
                  </div>
                ))}
              {openFailures === 0 && (
                <div className="px-5 py-4 text-sm text-gray-400">No open failures.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
