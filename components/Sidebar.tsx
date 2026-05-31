'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/protocols', label: 'Test Protocols' },
  { href: '/test-runs', label: 'Test Runs' },
  { href: '/fixtures', label: 'Fixtures' },
  { href: '/failures', label: 'Failure Log' },
  { href: '/reports', label: 'Reports' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-52 shrink-0 min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <div className="px-5 py-4 border-b border-gray-800">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">TestBench</div>
        <div className="text-base font-semibold text-white mt-0.5">Tracker</div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {links.map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded text-sm transition-colors ${
                active
                  ? 'bg-gray-800 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-gray-800">
        <div className="text-xs text-gray-600">v1.0 - Demo</div>
      </div>
    </aside>
  )
}
