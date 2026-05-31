export type ProtocolStatus = 'draft' | 'active' | 'archived'
export type TestResult = 'pass' | 'fail' | 'needs_review'
export type FixtureStatus = 'active' | 'inactive' | 'under_maintenance' | 'retired'
export type FailureSeverity = 'critical' | 'major' | 'minor'
export type FailureDisposition = 'scrap' | 'rework' | 'use_as_is' | 'pending'
export type FailureStatus = 'open' | 'in_progress' | 'closed' | 'cancelled'

export interface AcceptanceCriterion {
  id: string
  parameter: string
  unit: string
  min?: number
  max?: number
  nominal?: number
  notes?: string
}

export interface Protocol {
  id: string
  name: string
  revision: string
  owner: string
  equipment_required: string[]
  fixture_required: string
  acceptance_criteria: AcceptanceCriterion[]
  status: ProtocolStatus
  created_at: string
  updated_at: string
}

export interface Measurement {
  criterion_id: string
  parameter: string
  value: number
  unit: string
  within_spec: boolean
}

export interface TestRun {
  id: string
  protocol_id: string
  protocol_revision: string
  unit_id: string
  operator: string
  fixture_id: string
  date: string
  measurements: Measurement[]
  result: TestResult
  observations: string
  created_at: string
  updated_at: string
}

export interface Fixture {
  id: string
  name: string
  type: string
  location: string
  status: FixtureStatus
  last_check_date: string | null
  next_check_date: string | null
  notes: string
  created_at: string
  updated_at: string
}

export interface Failure {
  id: string
  test_run_id: string
  failure_mode: string
  severity: FailureSeverity
  suspected_cause: string
  disposition: FailureDisposition
  corrective_action: string
  owner: string
  status: FailureStatus
  opened_date: string
  closed_date: string | null
  created_at: string
  updated_at: string
}

export interface AppState {
  protocols: Protocol[]
  testRuns: TestRun[]
  fixtures: Fixture[]
  failures: Failure[]
}
