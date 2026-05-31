'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { generateId, today, nowISO, withinSpec } from '@/lib/utils'
import type { Measurement, TestResult } from '@/lib/types'

interface MeasurementRow extends Measurement {
  raw: string
}

function NewTestRunForm() {
  const { state, dispatch } = useStore()
  const router = useRouter()
  const params = useSearchParams()
  const preselectedProtocol = params.get('protocol') ?? ''

  const [protocolId, setProtocolId] = useState(preselectedProtocol)
  const [unitId, setUnitId] = useState('')
  const [operator, setOperator] = useState('')
  const [fixtureId, setFixtureId] = useState('')
  const [date, setDate] = useState(today())
  const [rows, setRows] = useState<MeasurementRow[]>([])
  const [result, setResult] = useState<TestResult>('pass')
  const [resultOverride, setResultOverride] = useState(false)
  const [observations, setObservations] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const selectedProtocol = state.protocols.find(p => p.id === protocolId)
  const activeFixtures = state.fixtures.filter(f => f.status === 'active')
  const knownOperators = [...new Set(state.testRuns.map(tr => tr.operator))].sort()

  useEffect(() => {
    if (!selectedProtocol) { setRows([]); return }
    setFixtureId(selectedProtocol.fixture_required || '')
    setRows(
      selectedProtocol.acceptance_criteria.map(ac => ({
        criterion_id: ac.id,
        parameter: ac.parameter,
        value: 0,
        unit: ac.unit,
        within_spec: false,
        raw: '',
      }))
    )
  }, [protocolId, selectedProtocol])

  function updateRow(criterion_id: string, raw: string) {
    const ac = selectedProtocol?.acceptance_criteria.find(c => c.id === criterion_id)
    const num = parseFloat(raw)
    const ws = !isNaN(num) && ac ? withinSpec(num, ac.min, ac.max) : false
    setRows(prev => prev.map(r =>
      r.criterion_id === criterion_id
        ? { ...r, raw, value: isNaN(num) ? 0 : num, within_spec: ws }
        : r
    ))
  }

  useEffect(() => {
    if (resultOverride) return
    const allFilled = rows.every(r => r.raw !== '')
    if (!allFilled || rows.length === 0) return
    const anyFail = rows.some(r => !r.within_spec)
    setResult(anyFail ? 'fail' : 'pass')
  }, [rows, resultOverride])

  function validate() {
    const errs: string[] = []
    if (!protocolId) errs.push('Protocol is required.')
    if (!unitId.trim()) errs.push('Unit ID is required.')
    if (!operator.trim()) errs.push('Operator is required.')
    if (!date) errs.push('Date is required.')
    if (rows.some(r => r.raw === '')) errs.push('All measurement values are required.')
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])

    const id = generateId('TR')
    const measurements: Measurement[] = rows.map(r => ({
      criterion_id: r.criterion_id,
      parameter: r.parameter,
      value: r.value,
      unit: r.unit,
      within_spec: r.within_spec,
    }))

    const now = nowISO()
    dispatch({
      type: 'ADD_TEST_RUN',
      payload: {
        id,
        protocol_id: protocolId,
        protocol_revision: selectedProtocol?.revision ?? '',
        unit_id: unitId.trim(),
        operator: operator.trim(),
        fixture_id: fixtureId,
        date,
        measurements,
        result,
        observations: observations.trim(),
        created_at: now,
        updated_at: now,
      },
    })
    router.push(`/test-runs/${id}`)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Test Run</h1>
        <p className="text-sm text-gray-500 mt-1">Select a protocol and record measured values.</p>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 space-y-1">
          {errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Run Details</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Protocol</label>
            <select
              value={protocolId}
              onChange={e => { setProtocolId(e.target.value); setResultOverride(false) }}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Select protocol --</option>
              {state.protocols.filter(p => p.status === 'active').map(p => (
                <option key={p.id} value={p.id}>{p.name} (Rev {p.revision})</option>
              ))}
            </select>
          </div>

          {selectedProtocol && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Revision: <span className="font-mono font-medium">{selectedProtocol.revision}</span>
              {' '} | Fixture: <span className="font-medium">{state.fixtures.find(f => f.id === selectedProtocol.fixture_required)?.name ?? selectedProtocol.fixture_required}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit ID</label>
              <input
                type="text"
                value={unitId}
                onChange={e => setUnitId(e.target.value)}
                placeholder="e.g., PRV-2025-051"
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Operator</label>
              <input
                type="text"
                value={operator}
                onChange={e => setOperator(e.target.value)}
                placeholder="e.g., J. Ochoa"
                list="operators"
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <datalist id="operators">
                {knownOperators.map(op => <option key={op} value={op} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fixture</label>
              <select
                value={fixtureId}
                onChange={e => setFixtureId(e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Select fixture --</option>
                {activeFixtures.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.location})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Measurements</h2>
            <p className="text-xs text-gray-500 mb-4">
              Enter measured values. Within-spec status is calculated automatically from acceptance criteria.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">Parameter</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">Spec</th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">Measured</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const ac = selectedProtocol?.acceptance_criteria.find(c => c.id === row.criterion_id)
                  const specParts = [
                    ac?.min !== undefined ? `>= ${ac.min}` : '',
                    ac?.max !== undefined ? `<= ${ac.max}` : '',
                  ].filter(Boolean).join(', ')
                  return (
                    <tr key={row.criterion_id} className="border-b border-gray-50">
                      <td className="py-2 pr-4 text-gray-800">
                        {row.parameter}
                        <span className="text-gray-400 ml-1 text-xs">{row.unit}</span>
                      </td>
                      <td className="py-2 pr-4 text-gray-500 text-xs font-mono">{specParts || 'N/A'}</td>
                      <td className="py-2 pr-4">
                        <input
                          type="number"
                          step="any"
                          value={row.raw}
                          onChange={e => updateRow(row.criterion_id, e.target.value)}
                          placeholder="0.0"
                          className="w-24 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2">
                        {row.raw === '' ? (
                          <span className="text-gray-300 text-xs">--</span>
                        ) : row.within_spec ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Pass</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">Fail</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Result and Observations</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Overall Result
              {!resultOverride && rows.length > 0 && (
                <span className="text-gray-400 ml-2 font-normal">(auto-calculated from measurements)</span>
              )}
            </label>
            <div className="flex items-center gap-3">
              <select
                value={result}
                onChange={e => { setResult(e.target.value as TestResult); setResultOverride(true) }}
                className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="needs_review">Needs Review</option>
              </select>
              {resultOverride && (
                <button
                  type="button"
                  onClick={() => setResultOverride(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Reset to auto
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observations and Notes</label>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={3}
              placeholder="Any notable observations, anomalies, or comments about the test..."
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
          >
            Save Test Run
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2 text-gray-600 text-sm font-medium border border-gray-200 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NewTestRunPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading...</div>}>
      <NewTestRunForm />
    </Suspense>
  )
}
