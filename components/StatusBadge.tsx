type BadgeKey =
  | 'pass' | 'fail' | 'needs_review'
  | 'active' | 'draft' | 'archived'
  | 'inactive' | 'under_maintenance' | 'retired'
  | 'critical' | 'major' | 'minor'
  | 'open' | 'in_progress' | 'closed' | 'cancelled'
  | 'scrap' | 'rework' | 'use_as_is' | 'pending'
  | 'true' | 'false'

const styles: Record<string, string> = {
  pass: 'bg-green-100 text-green-800',
  fail: 'bg-red-100 text-red-800',
  needs_review: 'bg-yellow-100 text-yellow-800',
  active: 'bg-blue-100 text-blue-800',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-gray-100 text-gray-400',
  inactive: 'bg-gray-100 text-gray-500',
  under_maintenance: 'bg-orange-100 text-orange-800',
  retired: 'bg-gray-200 text-gray-500',
  critical: 'bg-red-100 text-red-800',
  major: 'bg-orange-100 text-orange-800',
  minor: 'bg-yellow-100 text-yellow-700',
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-blue-100 text-blue-700',
  closed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  scrap: 'bg-red-100 text-red-700',
  rework: 'bg-orange-100 text-orange-700',
  use_as_is: 'bg-blue-100 text-blue-700',
  pending: 'bg-gray-100 text-gray-600',
  true: 'bg-green-100 text-green-700',
  false: 'bg-red-100 text-red-700',
}

const labels: Record<string, string> = {
  needs_review: 'Needs Review',
  in_progress: 'In Progress',
  under_maintenance: 'Maintenance',
  use_as_is: 'Use As-Is',
  true: 'Pass',
  false: 'Fail',
}

interface Props {
  value: string | boolean
  size?: 'sm' | 'md'
}

export function StatusBadge({ value, size = 'sm' }: Props) {
  const key = String(value)
  const cls = styles[key] ?? 'bg-gray-100 text-gray-600'
  const raw = key.replace(/_/g, ' ')
  const label = labels[key] ?? (raw.charAt(0).toUpperCase() + raw.slice(1))
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
  return (
    <span className={`inline-flex items-center rounded font-medium ${padding} ${cls}`}>
      {label}
    </span>
  )
}
