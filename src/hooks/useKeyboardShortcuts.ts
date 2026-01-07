'use client';

import { useEffect, useCallback } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

interface ShortcutHandler {
  keys: string[];
  description: string;
  category: string;
  handler: (event: KeyboardEvent) => void;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();

  useEffect(() => {
    const temporalState = useBudgetStore.temporal.getState();

    // Define all keyboard shortcuts
    const shortcuts: ShortcutHandler[] = [
      {
        keys: ['Ctrl+Z', 'Cmd+Z'],
        description: 'Undo last action',
        category: 'Actions',
        handler: () => temporalState.undo(),
      },
      {
        keys: ['Ctrl+Shift+Z', 'Cmd+Shift+Z'],
        description: 'Redo last action',
        category: 'Actions',
        handler: () => temporalState.redo(),
      },
      {
        keys: ['Ctrl+T', 'Cmd+T'],
        description: 'Toggle theme (Light/Dark/System)',
        category: 'Theme',
        handler: () => {
          // Get current theme and cycle it
          const html = document.documentElement;
          const isDark = html.classList.contains('dark');
          setTheme(isDark ? 'light' : 'dark');
        },
      },
      {
        keys: ['Alt+1', 'Cmd+1'],
        description: 'Navigate to Forecast',
        category: 'Navigation',
        handler: () => router.push('/forecast'),
      },
      {
        keys: ['Alt+2', 'Cmd+2'],
        description: 'Navigate to Calendar',
        category: 'Navigation',
        handler: () => router.push('/calendar'),
      },
      {
        keys: ['Alt+3', 'Cmd+3'],
        description: 'Navigate to Budget Rules',
        category: 'Navigation',
        handler: () => router.push('/budget'),
      },
      {
        keys: ['Alt+4', 'Cmd+4'],
        description: 'Navigate to Settings',
        category: 'Navigation',
        handler: () => router.push('/settings'),
      },
      {
        keys: ['Ctrl+/', 'Cmd+/'],
        description: 'Show keyboard shortcuts',
        category: 'Help',
        handler: (e) => {
          e.preventDefault();
          // Dispatch custom event to show help dialog
          window.dispatchEvent(new CustomEvent('show-shortcuts-help'));
        },
      },
      {
        keys: ['Escape'],
        description: 'Close modals/dialogs',
        category: 'Actions',
        handler: (e) => {
          // Dispatch custom event to close all modals
          window.dispatchEvent(new CustomEvent('close-all-modals'));
        },
      },
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' ||
                     target.tagName === 'TEXTAREA' ||
                     target.isContentEditable;

      if (isInput) {
        // Only allow Escape in input fields
        if (event.key === 'Escape') {
          const escapeShortcut = shortcuts.find(s => s.keys.includes('Escape'));
          escapeShortcut?.handler(event);
        }
        return;
      }

      // Build key combination string
      const parts: string[] = [];
      if (event.ctrlKey) parts.push('Ctrl');
      if (event.metaKey) parts.push('Cmd');
      if (event.altKey) parts.push('Alt');
      if (event.shiftKey) parts.push('Shift');
      parts.push(event.key);

      const keyCombo = parts.join('+');

      // Find matching shortcut
      const shortcut = shortcuts.find(s => s.keys.includes(keyCombo));

      if (shortcut) {
        event.preventDefault();
        shortcut.handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, pathname, setTheme]);
}
