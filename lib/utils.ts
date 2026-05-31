export function generateId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `${prefix}-${ts}${rnd}`
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function formatDate(s: string): string {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function isOverdue(nextCheckDate: string | null): boolean {
  if (!nextCheckDate) return false
  return new Date(nextCheckDate) < new Date()
}

export function isDueSoon(nextCheckDate: string | null, days = 30): boolean {
  if (!nextCheckDate) return false
  const due = new Date(nextCheckDate)
  const now = new Date()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + days)
  return due >= now && due <= cutoff
}

export function withinSpec(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return true
}
