import dayjs from 'dayjs';
import { BudgetRule, OneTimeTransaction } from '@/types';
import { useBudgetStore } from '@/store/useBudgetStore';

/**
 * Budget rules extracted from STU Loan Pay Plan with Sim.xlsx
 * Generated on 2026-01-07
 */
export function generateSampleData() {
  const today = new Date();

  return {
    currentBalance: 473.69, // Starting balance from simulation
    rules: generateSampleRules(today),
    transactions: generateSampleTransactions(today),
    checkpoints: {},
  };
}

function generateSampleRules(today: Date): BudgetRule[] {
  return [
    // ============== WEEKLY INCOME ==============
    {
      id: 'rule-pay-lm',
      name: 'PAY-LM',
      amount: 1453.0,
      type: 'income',
      category: 'other',
      frequency: 'weekly',
      recurrence_day: 6, // Saturday (day 6 from Excel - Friday paycheck)
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },

    // ============== MONTHLY EXPENSES ==============
    {
      id: 'rule-rent',
      name: 'Rent',
      amount: 1733.0,
      type: 'expense',
      category: 'housing',
      frequency: 'monthly',
      recurrence_day: 1,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-car',
      name: 'Car',
      amount: 503.35,
      type: 'expense',
      category: 'transport',
      frequency: 'monthly',
      recurrence_day: 2,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-mom-rent',
      name: 'Mom Rent',
      amount: 850.0,
      type: 'expense',
      category: 'housing',
      frequency: 'monthly',
      recurrence_day: 20,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-groceries',
      name: 'Groceries',
      amount: 300.0,
      type: 'expense',
      category: 'food',
      frequency: 'monthly',
      recurrence_day: 2,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-savings',
      name: 'Savings',
      amount: 1000.0,
      type: 'expense', // Transfer out = expense from checking perspective
      category: 'other',
      frequency: 'monthly',
      recurrence_day: 28,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-att',
      name: 'AT&T',
      amount: 65.0,
      type: 'expense',
      category: 'utilities',
      frequency: 'monthly',
      recurrence_day: 18,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-ga-power',
      name: 'GA Power',
      amount: 70.0,
      type: 'expense',
      category: 'utilities',
      frequency: 'monthly',
      recurrence_day: 5,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-th',
      name: 'TH',
      amount: 400.0,
      type: 'expense',
      category: 'other',
      frequency: 'monthly',
      recurrence_day: 26,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },

    // ============== SUBSCRIPTIONS (Monthly) ==============
    {
      id: 'rule-amazon-prime',
      name: 'Amazon Prime',
      amount: 7.48,
      type: 'expense',
      category: 'subscription',
      frequency: 'monthly',
      recurrence_day: 8,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-yt-premium',
      name: 'YT Premium',
      amount: 22.99,
      type: 'expense',
      category: 'subscription',
      frequency: 'monthly',
      recurrence_day: 9,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-netflix',
      name: 'Netflix',
      amount: 24.6,
      type: 'expense',
      category: 'subscription',
      frequency: 'monthly',
      recurrence_day: 29,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-spotify',
      name: 'Spotify',
      amount: 11.99,
      type: 'expense',
      category: 'subscription',
      frequency: 'monthly',
      recurrence_day: 8,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-rocket-money',
      name: 'Rocket Money',
      amount: 6.0,
      type: 'expense',
      category: 'subscription',
      frequency: 'monthly',
      recurrence_day: 12,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-little4much',
      name: 'Little4Much',
      amount: 150.0,
      type: 'expense',
      category: 'subscription',
      frequency: 'monthly',
      recurrence_day: 28,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-crunchyroll',
      name: 'Crunchyroll',
      amount: 8.53,
      type: 'expense',
      category: 'subscription',
      frequency: 'monthly',
      recurrence_day: 27,
      start_date: dayjs(today).subtract(1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).subtract(1, 'year').toDate(),
      updated_at: new Date(),
    },

    // ============== ANNUAL EXPENSES ==============
    {
      id: 'rule-car-insurance',
      name: 'Car Insurance',
      amount: 1999.1,
      type: 'expense',
      category: 'transport',
      frequency: 'yearly',
      recurrence_day: null,
      start_date: new Date('2024-12-17'),
      end_date: null,
      is_active: true,
      created_at: new Date('2024-12-17'),
      updated_at: new Date(),
    },
    {
      id: 'rule-phone-bill-annual',
      name: 'Phone Bill (Annual)',
      amount: 300.0,
      type: 'expense',
      category: 'utilities',
      frequency: 'yearly',
      recurrence_day: null,
      start_date: new Date('2025-09-15'),
      end_date: null,
      is_active: true,
      created_at: new Date('2025-09-15'),
      updated_at: new Date(),
    },
  ];
}

function generateSampleTransactions(today: Date): OneTimeTransaction[] {
  // Credit Card Payments - One-time transactions from Excel
  // These were listed as specific month/day payments (December 2024)
  return [
    {
      id: 'trans-capital-one',
      date: new Date('2024-12-07'),
      description: 'Capital One Credit Card Payment',
      amount: 467.61,
      type: 'expense',
      is_reconciled: true,
      created_at: new Date('2024-12-07'),
      updated_at: new Date(),
    },
    {
      id: 'trans-chase',
      date: new Date('2024-12-04'),
      description: 'Chase Credit Card Payment',
      amount: 406.0,
      type: 'expense',
      is_reconciled: true,
      created_at: new Date('2024-12-04'),
      updated_at: new Date(),
    },
    {
      id: 'trans-nfcu',
      date: new Date('2024-12-06'),
      description: 'NFCU Credit Card Payment',
      amount: 72.0,
      type: 'expense',
      is_reconciled: true,
      created_at: new Date('2024-12-06'),
      updated_at: new Date(),
    },
  ];
}

export function loadSampleData() {
  const data = generateSampleData();

  // Load into store
  const { setBalance, setRules, setTransactions } = useBudgetStore.getState();

  setBalance(data.currentBalance);
  setRules(data.rules);
  setTransactions(data.transactions);

  return {
    rules: data.rules.length,
    transactions: data.transactions.length,
    totalIncome: data.rules
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0),
    totalExpenses: data.rules
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0),
  };
}
