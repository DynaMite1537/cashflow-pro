'use client';

import { useState, useEffect } from 'react';
import { X, Keyboard, RotateCcw, RotateCw, Palette, Navigation, HelpCircle } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const defaultShortcuts: Shortcut[] = [
  {
    keys: ['Ctrl+Z', 'Cmd+Z'],
    description: 'Undo last action',
    category: 'Actions',
  },
  {
    keys: ['Ctrl+Shift+Z', 'Cmd+Shift+Z'],
    description: 'Redo last action',
    category: 'Actions',
  },
  {
    keys: ['Escape'],
    description: 'Close modals/dialogs',
    category: 'Actions',
  },
  {
    keys: ['Ctrl+T', 'Cmd+T'],
    description: 'Toggle theme',
    category: 'Theme',
  },
  {
    keys: ['Alt+1', 'Cmd+1'],
    description: 'Navigate to Forecast',
    category: 'Navigation',
  },
  {
    keys: ['Alt+2', 'Cmd+2'],
    description: 'Navigate to Calendar',
    category: 'Navigation',
  },
  {
    keys: ['Alt+3', 'Cmd+3'],
    description: 'Navigate to Budget Rules',
    category: 'Navigation',
  },
  {
    keys: ['Alt+4', 'Cmd+4'],
    description: 'Navigate to Settings',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl+/', 'Cmd+/'],
    description: 'Show this help',
    category: 'Help',
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  Actions: <RotateCcw size={16} />,
  Theme: <Palette size={16} />,
  Navigation: <Navigation size={16} />,
  Help: <HelpCircle size={16} />,
};

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShowHelp = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('show-shortcuts-help', handleShowHelp);
    window.addEventListener('close-all-modals', handleClose);

    return () => {
      window.removeEventListener('show-shortcuts-help', handleShowHelp);
      window.removeEventListener('close-all-modals', handleClose);
    };
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-card border border-border rounded-full shadow-lg hover:shadow-xl transition-shadow group"
        title="Keyboard Shortcuts (Ctrl+/)"
      >
        <Keyboard size={20} className="text-muted-foreground group-hover:text-foreground" />
      </button>
    );
  }

  // Group shortcuts by category
  const groupedShortcuts = defaultShortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, Shortcut[]>
  );

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Keyboard size={24} className="text-primary" />
            <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Close (Escape)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <div className="text-muted-foreground">{categoryIcons[category]}</div>
                  {category}
                </div>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-muted-foreground flex-1">{shortcut.description}</span>
                      <div className="flex gap-2 flex-shrink-0">
                        {shortcut.keys.map((key, keyIdx) => (
                          <kbd
                            key={keyIdx}
                            className="px-2.5 py-1.5 bg-muted border border-border rounded text-xs font-mono font-medium whitespace-nowrap"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="flex-shrink-0">💡</span>
              <span>
                Tip: Shortcuts don&apos;t work when typing in input fields. Press{' '}
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded font-mono text-xs">
                  Escape
                </kbd>{' '}
                to close this dialog.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
