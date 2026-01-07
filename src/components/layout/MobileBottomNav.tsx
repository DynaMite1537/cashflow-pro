'use client';

import { Home, Calendar, DollarSign, Settings, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const navItems = [
    { id: 'forecast', label: 'Forecast', icon: Home, href: '/forecast' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
    { id: 'budget', label: 'Budget', icon: DollarSign, href: '/budget' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <>
      {/* Mobile Header - visible on small screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <span className="font-mono font-bold text-lg">$</span>
          </div>
          <span className="font-bold">CashFlow Pro</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <ChevronUp size={20} className={expanded ? 'rotate-180' : ''} />
        </button>
      </div>

      {/* Expanded Quick Actions Panel */}
      {expanded && (
        <div className="lg:hidden fixed top-14 left-0 right-0 bg-card border-b border-border shadow-lg z-40 p-4 space-y-3">
          <Link
            href="/forecast"
            className="flex items-center gap-3 p-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
          >
            <Home size={20} className="text-primary" />
            <div>
              <p className="font-medium">Quick Add</p>
              <p className="text-xs text-muted-foreground">Add one-time transaction</p>
            </div>
          </Link>
          <Link
            href="/forecast"
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Calendar size={20} className="text-foreground" />
            <div>
              <p className="font-medium">View Calendar</p>
              <p className="text-xs text-muted-foreground">Monthly view</p>
            </div>
          </Link>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-50">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex flex-col items-center justify-center w-full h-full
                transition-colors gap-1
                ${isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon size={20} className={isActive ? 'text-primary' : ''} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom padding for main content */}
      <div className="lg:hidden h-16" />
    </>
  );
}
