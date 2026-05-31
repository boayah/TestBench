import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { StoreProvider } from '@/lib/store'

export const metadata: Metadata = {
  title: 'TestBench Tracker',
  description: 'Engineering test operations platform for tracking protocols, test runs, fixtures, and failures.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex antialiased">
        <StoreProvider>
          <Sidebar />
          <main className="flex-1 min-h-screen overflow-auto">
            {children}
          </main>
        </StoreProvider>
      </body>
    </html>
  )
}
