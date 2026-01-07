import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { ToastProvider } from '@/components/ui/Toast'
import { QueryProvider } from '@/app/providers/QueryClientProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CashFlow Pro',
  description: 'Financial simulation and forecasting tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <QueryProvider>
            <DashboardShell>
              {children}
            </DashboardShell>
          </QueryProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
