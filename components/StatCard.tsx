type Accent = 'default' | 'green' | 'red' | 'yellow' | 'blue'

const valueColor: Record<Accent, string> = {
  default: 'text-gray-900',
  green: 'text-green-700',
  red: 'text-red-700',
  yellow: 'text-yellow-700',
  blue: 'text-blue-700',
}

interface Props {
  label: string
  value: number | string
  detail?: string
  accent?: Accent
}

export function StatCard({ label, value, detail, accent = 'default' }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
      <div className="text-sm text-gray-500 font-medium">{label}</div>
      <div className={`text-3xl font-semibold mt-1 ${valueColor[accent]}`}>{value}</div>
      {detail && <div className="text-xs text-gray-400 mt-1">{detail}</div>}
    </div>
  )
}
