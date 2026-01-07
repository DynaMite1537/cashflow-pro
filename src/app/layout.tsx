import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { ToastProvider } from '@/components/ui/Toast'
import { QueryProvider } from '@/app/providers/QueryClientProvider'
import { ThemeProvider } from '@/components/ui/ThemeProvider'

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <QueryProvider>
              <DashboardShell>
                {children}
              </DashboardShell>
            </QueryProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
