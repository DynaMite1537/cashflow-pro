import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import { temporal } from 'zundo';
import { persist } from 'zustand/middleware';
import { BudgetRule, OneTimeTransaction, SaveStatus } from '@/types';

// Helper to revive dates from JSON
const reviver = (key: string, value: any) => {
  if (key === 'start_date' || key === 'end_date' || key === 'date' || key === 'created_at' || key === 'updated_at') {
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  return value;
};

interface BudgetState {
  // State
  currentBalance: number;
  rules: BudgetRule[];
  transactions: OneTimeTransaction[];
  checkpoints: Record<string, number>; // ISO date string -> balance
  saveStatus: SaveStatus;

  // Actions - Balance
  setBalance: (amount: number) => void;

  // Actions - Rules
  setRules: (rules: BudgetRule[]) => void;
  addRule: (rule: Omit<BudgetRule, 'id' | 'created_at' | 'updated_at'>) => void;
  updateRule: (id: string, rule: Partial<BudgetRule>) => void;
  deleteRule: (id: string) => void;

  // Actions - Transactions
  setTransactions: (transactions: OneTimeTransaction[]) => void;
  addTransaction: (transaction: Omit<OneTimeTransaction, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTransaction: (id: string, transaction: Partial<OneTimeTransaction>) => void;
  deleteTransaction: (id: string) => void;

  // Actions - Checkpoints
  setCheckpoints: (checkpoints: Record<string, number>) => void;
  setCheckpoint: (date: string, balance: number) => void;
  removeCheckpoint: (date: string) => void;

  // Actions - Save Status
  setSaveStatus: (status: SaveStatus) => void;

  // Actions - Bulk
  resetAll: () => void;
}

export const useBudgetStore = create<BudgetState>()(
  temporal(
    persist(
      (set) => ({
        // Initial State
        currentBalance: 0,
        rules: [],
        transactions: [],
        checkpoints: {},
        saveStatus: 'idle',

        // Balance Actions
        setBalance: (amount) => set({ currentBalance: amount, saveStatus: 'saving' }),

        // Rule Actions
        setRules: (rules) => set({ rules, saveStatus: 'saving' }),
        addRule: (rule) => set((state) => ({
          rules: [
            {
              ...rule,
              id: crypto.randomUUID(),
              created_at: new Date(),
              updated_at: new Date(),
            },
            ...state.rules,
          ],
          saveStatus: 'saving',
        })),
        updateRule: (id, updates) => set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, ...updates, updated_at: new Date() } : r
          ),
          saveStatus: 'saving',
        })),
        deleteRule: (id) => set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
          saveStatus: 'saving',
        })),

        // Transaction Actions
        setTransactions: (transactions) => set({ transactions, saveStatus: 'saving' }),
        addTransaction: (transaction) => set((state) => ({
          transactions: [
            {
              ...transaction,
              id: crypto.randomUUID(),
              created_at: new Date(),
              updated_at: new Date(),
            },
            ...state.transactions,
          ],
          saveStatus: 'saving',
        })),
        updateTransaction: (id, updates) => set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates, updated_at: new Date() } : t
          ),
          saveStatus: 'saving',
        })),
        deleteTransaction: (id) => set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
          saveStatus: 'saving',
        })),

        // Checkpoint Actions
        setCheckpoints: (checkpoints) => set({ checkpoints, saveStatus: 'saving' }),
        setCheckpoint: (date, balance) => set((state) => ({
          checkpoints: { ...state.checkpoints, [date]: balance },
          saveStatus: 'saving',
        })),
        removeCheckpoint: (date) => set((state) => {
          const newCheckpoints = { ...state.checkpoints };
          delete newCheckpoints[date];
          return { checkpoints: newCheckpoints, saveStatus: 'saving' };
        }),

        // Save Status Actions
        setSaveStatus: (status) => set({ saveStatus: status }),

        // Reset
        resetAll: () =>
          set({
            currentBalance: 0,
            rules: [],
            transactions: [],
            checkpoints: {},
            saveStatus: 'idle',
          }),
      }),
      {
        name: 'cashflow-storage',
        version: 1,
        // Persist only data, not save status
        partialize: (state) => ({
          currentBalance: state.currentBalance,
          rules: state.rules,
          transactions: state.transactions,
          checkpoints: state.checkpoints,
        }),
        // Hydrate state with date conversion
        onRehydrateStorage: () => (state) => {
          if (!state) return;

          // Convert date strings to Date objects in rules
          state.rules = state.rules.map((rule: BudgetRule) => ({
            ...rule,
            start_date: rule.start_date instanceof Date ? rule.start_date : new Date(rule.start_date),
            end_date: rule.end_date instanceof Date ? rule.end_date : (rule.end_date ? new Date(rule.end_date) : null),
            created_at: rule.created_at instanceof Date ? rule.created_at : new Date(rule.created_at),
            updated_at: rule.updated_at instanceof Date ? rule.updated_at : new Date(rule.updated_at),
          }));

          // Convert date strings to Date objects in transactions
          state.transactions = state.transactions.map((tx: OneTimeTransaction) => ({
            ...tx,
            date: tx.date instanceof Date ? tx.date : new Date(tx.date),
            created_at: tx.created_at instanceof Date ? tx.created_at : new Date(tx.created_at),
            updated_at: tx.updated_at instanceof Date ? tx.updated_at : new Date(tx.updated_at),
          }));
        },
        // Handle migrations if needed
        migrate: (persistedState: any, version: number) => {
          if (version === 0) {
            // Migration from version 0 to 1
            return persistedState;
          }
          return persistedState;
        },
      }
    ),
    {
      limit: 50, // Remember last 50 actions
    }
  )
);

// Helper hooks for specific state slices (use shallow for performance)
export const useRules = () => useBudgetStore((state) => state.rules);
export const useTransactions = () => useBudgetStore((state) => state.transactions);
export const useCheckpoints = () => useBudgetStore((state) => state.checkpoints);
export const useCurrentBalance = () => useBudgetStore((state) => state.currentBalance);
export const useSaveStatus = () => useBudgetStore((state) => state.saveStatus);

// Combined selectors with shallow comparison
export const useBudgetData = () => useBudgetStore(
  (state) => ({
    currentBalance: state.currentBalance,
    rules: state.rules,
    transactions: state.transactions,
    checkpoints: state.checkpoints,
  }),
  shallow
);

export const useSimulationData = () => useBudgetStore(
  (state) => ({
    currentBalance: state.currentBalance,
    rules: state.rules,
    transactions: state.transactions,
    checkpoints: state.checkpoints,
  }),
  shallow
);

// Export store actions for non-component usage
export const budgetActions = useBudgetStore.getState;

// Export temporal actions for undo/redo
export const temporalActions = useBudgetStore.temporal.getState;
