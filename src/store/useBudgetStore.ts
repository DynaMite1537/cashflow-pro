import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import { temporal } from 'zundo';
import { persist } from 'zustand/middleware';
import { BudgetRule, OneTimeTransaction, SaveStatus, CreditCard, CreditCardPayment } from '@/types';

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
  creditCards: CreditCard[];
  creditCardPayments: CreditCardPayment[];
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
  setCheckpoints: (checkpointsValue: Record<string, number>) => void;
  setCheckpoint: (date: string, balance: number) => void;
  removeCheckpoint: (date: string) => void;

  // Actions - Save Status
  setSaveStatus: (status: SaveStatus) => void;

  // Actions - Credit Cards
  setCreditCards: (cards: CreditCard[]) => void;
  addCreditCard: (card: Omit<CreditCard, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;

  // Actions - Credit Card Payments
  addPayment: (payment: Omit<CreditCardPayment, 'id' | 'created_at'>) => void;
  updatePayment: (id: string, payment: Partial<CreditCardPayment>) => void;
  deletePayment: (id: string) => void;

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
        creditCards: [],
        creditCardPayments: [],
        saveStatus: 'idle',

        // Balance Actions
        setBalance: (amount) => set({ currentBalance: amount }),

        // Rule Actions
        setRules: (rulesValue) => set({ rules: rulesValue }),
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
        })),
        updateRule: (id, updates) => set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, ...updates, updated_at: new Date() } : r
          ),
        })),
        deleteRule: (id) => set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
        })),

        // Transaction Actions
        setTransactions: (transactionsValue) => set({ transactions: transactionsValue }),
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
        })),
        updateTransaction: (id, updates) => set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates, updated_at: new Date() } : t
          ),
        })),
        deleteTransaction: (id) => set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

        // Checkpoint Actions
        setCheckpoints: (checkpointsValue) => set({ checkpoints: checkpointsValue }),
        setCheckpoint: (date, balance) => set((state) => ({
          checkpoints: { ...state.checkpoints, [date]: balance },
        })),
        removeCheckpoint: (date) => set((state) => {
          const newCheckpoints = { ...state.checkpoints };
          delete newCheckpoints[date];
          return { checkpoints: newCheckpoints };
        }),

        // Save Status Actions
        setSaveStatus: (status) => set({ saveStatus: status }),

        // Credit Cards Actions
        setCreditCards: (cards) => set({ creditCards: cards }),
        addCreditCard: (card) => set((state) => ({
          creditCards: [
            {
              ...card,
              id: crypto.randomUUID(),
              created_at: new Date(),
              updated_at: new Date(),
            },
            ...state.creditCards,
          ],
        })),
        updateCreditCard: (id, card) => set((state) => ({
          creditCards: state.creditCards.map((c) =>
            c.id === id ? { ...c, ...card, updated_at: new Date() } : c
          ),
        })),
        deleteCreditCard: (id) => set((state) => ({
          creditCards: state.creditCards.filter((c) => c.id !== id),
        })),

        // Credit Card Payments Actions
        addPayment: (payment) => set((state) => ({
          creditCardPayments: [
            {
              ...payment,
              id: crypto.randomUUID(),
              created_at: new Date(),
            },
            ...state.creditCardPayments,
          ],
        })),
        updatePayment: (id, payment) => set((state) => ({
          creditCardPayments: state.creditCardPayments.map((p) =>
            p.id === id ? { ...payment, ...p } : p
          ),
        })),
        deletePayment: (id) => set((state) => ({
          creditCardPayments: state.creditCardPayments.filter((p) => p.id !== id),
        })),

        // Reset
        resetAll: () =>
          set({
            currentBalance: 0,
            rules: [],
            transactions: [],
            checkpoints: {},
            creditCards: [],
            creditCardPayments: [],
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
          creditCards: state.creditCards,
          creditCardPayments: state.creditCardPayments,
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

          // Convert date strings to Date objects in credit cards
          state.creditCards = state.creditCards.map((card: CreditCard) => ({
            ...card,
            dueDate: card.dueDate instanceof Date ? card.dueDate : new Date(card.dueDate),
            created_at: card.created_at instanceof Date ? card.created_at : new Date(card.created_at),
            updated_at: card.updated_at instanceof Date ? card.updated_at : new Date(card.updated_at),
          }));

          // Convert date strings to Date objects in payments
          state.creditCardPayments = state.creditCardPayments.map((payment: CreditCardPayment) => ({
            ...payment,
            paymentDate: payment.paymentDate instanceof Date ? payment.paymentDate : new Date(payment.paymentDate),
            created_at: payment.created_at instanceof Date ? payment.created_at : new Date(payment.created_at),
            updated_at: payment.updated_at instanceof Date ? payment.updated_at : new Date(payment.updated_at),
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

// Credit card hooks
export const useCreditCards = () => useBudgetStore((state) => state.creditCards);
export const useCreditCardPayments = () => useBudgetStore((state) => state.creditCardPayments);

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

// Hook for temporal state (undo/redo)
export const useTemporalState = () => {
  const state = useBudgetStore();
  const pastStates = (state as any).pastStates as any[];
  const futureStates = (state as any).futureStates as any[];
  const undo = (state as any).undo as any;
  const redo = (state as any).redo as any;

  return { pastStates, futureStates, undo, redo };
};
