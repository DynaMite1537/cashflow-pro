# CashFlow Pro - Implementation Guide

## 1. Project Overview
**Concept:** A financial simulation engine. Unlike Mint/YNAB which track *past* spending, this app forecasts the *future*.
**Goal:** Answer "What will my bank balance be on [Date]?" based on recurring rules and manual adjustments.
**Key Mechanism:** A daily ledger generated client-side that merges "Recurring Rules" (Budget), "Ad-Hoc Items" (One-offs), and "Reality Checkpoints" (Actual Bank Balances).

---

## 2. Technical Stack
*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **State Management:** Zustand (Store) + Zundo (Undo/Redo)
*   **Styling:** Tailwind CSS + CSS Variables (OKLCH)
*   **Visualization:** Recharts
*   **Date Handling:** date-fns

---

## 3. Data Architecture (TypeScript Models)

```typescript
// 1. The Rules (From "Budget" Sheet)
type Frequency = 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';

interface BudgetRule {
  id: string;
  name: string;
  amount: number; // Positive for Income, Negative for Expense
  type: 'income' | 'expense';
  frequency: Frequency;
  recurrenceDay: number; // e.g., 5 (for 5th of month) or 1 (for Monday)
  startDate: Date;
  active: boolean;
}

// 2. The Ad-Hoc Items (The "Space" to add extra income/spending)
interface OneTimeTransaction {
  id: string;
  date: string; // ISO Date
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

// 3. The Reality Anchors (Editable Balances)
interface BalanceCheckpoint {
  date: string; // ISO Date String (YYYY-MM-DD)
  balance: number; // The specific balance user hard-coded for this day
}
```

---

## 4. State Management (Persistence & Undo)

We use **Optimistic UI** with a history stack for Undo/Redo, and debounced auto-saving to the database.

### The Store (`store/useBudgetStore.ts`)
```typescript
import { create } from 'zustand';
import { temporal } from 'zundo'; // Undo Middleware
import { persist } from 'zustand/middleware'; // Persistence Middleware

interface BudgetState {
  currentBalance: number;
  transactions: OneTimeTransaction[];
  checkpoints: Record<string, number>; // Date -> Balance map
  status: 'idle' | 'saving' | 'saved' | 'error';
  
  // Actions
  setBalance: (amount: number) => void;
  addTransaction: (t: OneTimeTransaction) => void;
  setStatus: (s: 'idle' | 'saving' | 'saved' | 'error') => void;
}

export const useBudgetStore = create<BudgetState>()(
  temporal(
    persist(
      (set) => ({
        currentBalance: 0,
        transactions: [],
        checkpoints: {},
        status: 'idle',

        setBalance: (amount) => set({ currentBalance: amount, status: 'saving' }),
        addTransaction: (t) => set((state) => ({ 
          transactions: [...state.transactions, t],
          status: 'saving' 
        })),
        setStatus: (s) => set({ status: s }),
      }),
      {
        name: 'cashflow-storage',
        partialize: (state) => ({ 
          currentBalance: state.currentBalance, 
          transactions: state.transactions,
          checkpoints: state.checkpoints
        }),
      }
    ),
    { limit: 50 } // Remembers last 50 actions
  )
);
```

### Auto-Save Hook (`hooks/useAutoSave.ts`)
```typescript
import { useEffect } from 'react';
import { useBudgetStore } from '../store/useBudgetStore';
import { useDebounce } from 'use-debounce';

export function useAutoSave() {
  const { currentBalance, transactions, checkpoints, setStatus } = useBudgetStore();
  
  // Wait 1 second after typing stops before triggering save
  const [debouncedData] = useDebounce({ currentBalance, transactions, checkpoints }, 1000);

  useEffect(() => {
    const saveData = async () => {
        setStatus('saving');
        try {
            // await api.save(debouncedData); // Replace with actual API call
            setTimeout(() => setStatus('saved'), 500);
        } catch (e) {
            setStatus('error');
        }
    };
    if (debouncedData) saveData();
  }, [debouncedData]);
}
```

---

## 5. Core Frontend Components

### Global Layout (`components/layout/DashboardShell.tsx`)
Sidebar navigation structure using the defined OKLCH variables.

### Reality Anchor (`components/dashboard/RealityAnchor.tsx`)
The central "Current Balance" display.
- **Display Mode:** Large text showing current balance.
- **Edit Mode:** Clicking transforms it into an input field.
- **Logic:** Updating this sets a `BalanceCheckpoint` for today, re-anchoring the entire simulation.

### Quick Add Widget (`components/dashboard/QuickAddWidget.tsx`)
A persistent "Space" to add one-off transactions.
- **Tabs:** Income (+) / Expense (-)
- **Fields:** Amount, Description, Date (Defaults to Today).
- **Action:** Adds a `OneTimeTransaction` to the store.

### Simulation Logic Hook (`hooks/useSimulation.ts`)
The engine that combines everything into a visualizable timeline.

```typescript
export function useSimulation(
  currentBalance: number, 
  rules: BudgetRule[], 
  oneOffs: OneTimeTransaction[],
  checkpoints: Record<string, number>,
  days = 90
) {
  // Logic:
  // 1. Loop from Today -> Today + 90 days.
  // 2. If 'checkpoints[date]' exists, force balance to that amount.
  // 3. Else, calculate: PrevBalance + (DailyIncome - DailyExpense).
  // 4. Return array of daily states for the Chart/Table.
}
```

---

## 6. Visual Design System
Based on the provided OKLCH variables.

**Key Design Decisions:**
- **Sidebar:** `bg-sidebar` (Light gray/Muted) to separate nav.
- **Main Area:** `bg-background` (White) for maximum readability.
- **Primary Color:** `oklch(0.7858 0.1598 85.3091)` (Soft Purple) for actions.
- **Alerts:** `destructive` (Red) for negative balances.
- **Typography:** `Inter` for UI, `Fira Code` (Monospace) for all financial numbers.
