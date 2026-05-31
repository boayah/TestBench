import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase =
  url && key
    ? createClient(url, key)
    : null

export function isSupabaseConfigured(): boolean {
  return supabase !== null
}

// ---------------------------------------------------------------------------
// When Supabase is configured, use these helpers in place of the local store.
// The current UI uses the local React context store (lib/store.tsx) by default.
// To migrate, call these functions inside your pages/hooks and remove the
// dispatch calls to the local store.
// ---------------------------------------------------------------------------

export async function fetchProtocols() {
  if (!supabase) return null
  const { data, error } = await supabase.from('protocols').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchTestRuns(filters?: {
  protocol_id?: string
  result?: string
  fixture_id?: string
  operator?: string
  date_from?: string
  date_to?: string
}) {
  if (!supabase) return null
  let q = supabase.from('test_runs').select('*').order('date', { ascending: false })
  if (filters?.protocol_id) q = q.eq('protocol_id', filters.protocol_id)
  if (filters?.result) q = q.eq('result', filters.result)
  if (filters?.fixture_id) q = q.eq('fixture_id', filters.fixture_id)
  if (filters?.operator) q = q.eq('operator', filters.operator)
  if (filters?.date_from) q = q.gte('date', filters.date_from)
  if (filters?.date_to) q = q.lte('date', filters.date_to)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function fetchFixtures() {
  if (!supabase) return null
  const { data, error } = await supabase.from('fixtures').select('*').order('name')
  if (error) throw error
  return data
}

export async function fetchFailures() {
  if (!supabase) return null
  const { data, error } = await supabase.from('failures').select('*').order('opened_date', { ascending: false })
  if (error) throw error
  return data
}
