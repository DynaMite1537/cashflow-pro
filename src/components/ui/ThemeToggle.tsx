'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          'h-9 w-9 rounded-lg border border-border',
          'hover:bg-accent hover:text-accent-foreground',
          'inline-flex items-center justify-center',
          'transition-colors'
        )}
      >
        <Monitor size={18} className="text-muted-foreground" />
      </button>
    );
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={18} />;
      case 'dark':
        return <Moon size={18} />;
      case 'system':
        return <Monitor size={18} />;
      default:
        return <Sun size={18} />;
    }
  };

  const getNextTheme = () => {
    switch (theme) {
      case 'light':
        return 'dark';
      case 'dark':
        return 'system';
      case 'system':
      default:
        return 'light';
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  return (
    <button
      onClick={() => setTheme(getNextTheme())}
      title={`Current theme: ${getLabel()}. Click to switch.`}
      className={cn(
        'h-9 w-9 rounded-lg border border-border',
        'hover:bg-accent hover:text-accent-foreground',
        'inline-flex items-center justify-center',
        'transition-colors text-foreground'
      )}
    >
      {getIcon()}
    </button>
  );
}
