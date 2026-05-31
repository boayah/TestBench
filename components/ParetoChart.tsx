interface Entry {
  label: string
  count: number
}

export function ParetoChart({ data }: { data: Entry[] }) {
  const sorted = [...data].sort((a, b) => b.count - a.count)
  const max = sorted[0]?.count ?? 1

  if (sorted.length === 0) {
    return <div className="text-sm text-gray-400 text-center py-6">No failure data to display.</div>
  }

  return (
    <div className="space-y-2">
      {sorted.map((entry, i) => (
        <div key={i} className="flex items-center gap-3 min-w-0">
          <div className="w-52 text-xs text-gray-600 text-right truncate shrink-0" title={entry.label}>
            {entry.label}
          </div>
          <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
            <div
              className="h-full bg-red-400 rounded transition-all"
              style={{ width: `${(entry.count / max) * 100}%` }}
            />
          </div>
          <div className="w-6 text-xs font-semibold text-gray-700 text-right shrink-0">{entry.count}</div>
        </div>
      ))}
    </div>
  )
}
