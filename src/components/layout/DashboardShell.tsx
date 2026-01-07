'use client';

import { Wallet, LineChart, Calendar, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { id: 'forecast', label: 'Forecast', icon: LineChart, href: '/forecast' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
    { id: 'budget', label: 'Budget Rules', icon: Wallet, href: '/budget' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-sidebar-foreground">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground">
              <span className="font-mono font-bold text-lg">$</span>
            </div>
            CashFlow Pro
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}
                `}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Link
            href="/settings"
            className="flex items-center gap-3 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          >
            <Settings size={18} />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-background relative">
        <MobileBottomNav />
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
