'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { generateId, nowISO, today } from '@/lib/utils'
import type { AcceptanceCriterion, ProtocolStatus } from '@/lib/types'

interface CriterionRow {
  id: string
  parameter: string
  unit: string
  min: string
  max: string
  nominal: string
  notes: string
}

interface EquipmentRow {
  id: string
  value: string
}

function emptyCriterion(): CriterionRow {
  return { id: generateId('AC'), parameter: '', unit: '', min: '', max: '', nominal: '', notes: '' }
}

function emptyEquipment(): EquipmentRow {
  return { id: generateId('EQ'), value: '' }
}

export default function NewProtocolPage() {
  const { dispatch, state } = useStore()
  const router = useRouter()

  const [name, setName] = useState('')
  const [revision, setRevision] = useState('A')
  const [owner, setOwner] = useState('')
  const [fixtureRequired, setFixtureRequired] = useState('')
  const [status, setStatus] = useState<ProtocolStatus>('draft')
  const [equipment, setEquipment] = useState<EquipmentRow[]>([emptyEquipment()])
  const [criteria, setCriteria] = useState<CriterionRow[]>([emptyCriterion()])
  const [errors, setErrors] = useState<string[]>([])

  function validate() {
    const errs: string[] = []
    if (!name.trim()) errs.push('Protocol name is required.')
    if (!revision.trim()) errs.push('Revision is required.')
    if (!owner.trim()) errs.push('Owner is required.')
    if (criteria.some(c => !c.parameter.trim() || !c.unit.trim())) {
      errs.push('All acceptance criteria must have a parameter name and unit.')
    }
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])

    const parsedCriteria: AcceptanceCriterion[] = criteria
      .filter(c => c.parameter.trim())
      .map(c => ({
        id: c.id,
        parameter: c.parameter.trim(),
        unit: c.unit.trim(),
        min: c.min !== '' ? parseFloat(c.min) : undefined,
        max: c.max !== '' ? parseFloat(c.max) : undefined,
        nominal: c.nominal !== '' ? parseFloat(c.nominal) : undefined,
        notes: c.notes.trim() || undefined,
      }))

    const now = nowISO()
    const id = generateId('PROTO')
    dispatch({
      type: 'ADD_PROTOCOL',
      payload: {
        id,
        name: name.trim(),
        revision: revision.trim(),
        owner: owner.trim(),
        equipment_required: equipment.map(e => e.value.trim()).filter(Boolean),
        fixture_required: fixtureRequired,
        acceptance_criteria: parsedCriteria,
        status,
        created_at: now,
        updated_at: now,
      },
    })
    router.push(`/protocols/${id}`)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Test Protocol</h1>
        <p className="text-sm text-gray-500 mt-1">Define the protocol, required equipment, and acceptance criteria.</p>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 space-y-1">
          {errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Protocol Information</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Protocol Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Pressure Relief Valve Functional Test"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Revision</label>
              <input
                type="text"
                value={revision}
                onChange={e => setRevision(e.target.value)}
                placeholder="A"
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Owner</label>
              <input
                type="text"
                value={owner}
                onChange={e => setOwner(e.target.value)}
                placeholder="e.g., M. Torres"
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ProtocolStatus)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fixture Required</label>
            <select
              value={fixtureRequired}
              onChange={e => setFixtureRequired(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Select fixture --</option>
              {state.fixtures.map(f => (
                <option key={f.id} value={f.id}>{f.id} - {f.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Equipment Required</h2>
            <button
              type="button"
              onClick={() => setEquipment(eq => [...eq, emptyEquipment()])}
              className="text-xs text-blue-600 hover:underline"
            >
              + Add item
            </button>
          </div>
          {equipment.map((eq, i) => (
            <div key={eq.id} className="flex gap-2">
              <input
                type="text"
                value={eq.value}
                onChange={e => setEquipment(prev => prev.map(x => x.id === eq.id ? { ...x, value: e.target.value } : x))}
                placeholder={`Equipment item ${i + 1}`}
                className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {equipment.length > 1 && (
                <button
                  type="button"
                  onClick={() => setEquipment(prev => prev.filter(x => x.id !== eq.id))}
                  className="text-gray-400 hover:text-red-500 text-sm px-2"
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Acceptance Criteria</h2>
            <button
              type="button"
              onClick={() => setCriteria(c => [...c, emptyCriterion()])}
              className="text-xs text-blue-600 hover:underline"
            >
              + Add criterion
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Leave Min or Max blank if not applicable. Values are interpreted as inclusive bounds.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-2 font-medium text-gray-500 w-48">Parameter</th>
                  <th className="text-left py-2 pr-2 font-medium text-gray-500 w-16">Unit</th>
                  <th className="text-left py-2 pr-2 font-medium text-gray-500 w-16">Min</th>
                  <th className="text-left py-2 pr-2 font-medium text-gray-500 w-16">Max</th>
                  <th className="text-left py-2 pr-2 font-medium text-gray-500 w-16">Nominal</th>
                  <th className="text-left py-2 font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {criteria.map(c => (
                  <tr key={c.id}>
                    <td className="pr-2 pb-2">
                      <input
                        type="text"
                        value={c.parameter}
                        onChange={e => setCriteria(prev => prev.map(x => x.id === c.id ? { ...x, parameter: e.target.value } : x))}
                        placeholder="Parameter name"
                        className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="pr-2 pb-2">
                      <input
                        type="text"
                        value={c.unit}
                        onChange={e => setCriteria(prev => prev.map(x => x.id === c.id ? { ...x, unit: e.target.value } : x))}
                        placeholder="PSI"
                        className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    {(['min', 'max', 'nominal'] as const).map(field => (
                      <td key={field} className="pr-2 pb-2">
                        <input
                          type="number"
                          value={c[field]}
                          onChange={e => setCriteria(prev => prev.map(x => x.id === c.id ? { ...x, [field]: e.target.value } : x))}
                          placeholder="-"
                          className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                    <td className="pb-2">
                      {criteria.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setCriteria(prev => prev.filter(x => x.id !== c.id))}
                          className="text-gray-400 hover:text-red-500 px-1"
                        >
                          x
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
          >
            Create Protocol
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
