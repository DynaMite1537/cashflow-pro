import dayjs from 'dayjs';
import { BudgetRule, OneTimeTransaction } from '@/types';
import { useBudgetStore } from '@/store/useBudgetStore';

export function generateSampleData() {
  const today = new Date();
  
  return {
    currentBalance: 3200.00,
    rules: generateSampleRules(today),
    transactions: generateSampleTransactions(today),
    checkpoints: {},
  };
}

function generateSampleRules(today: Date): BudgetRule[] {
  return [
    // Income Rules
    {
      id: 'rule-1',
      name: 'Monthly Paycheck',
      amount: 3500.00,
      type: 'income',
      category: 'other',
      frequency: 'monthly',
      recurrence_day: 1,
      start_date: dayjs(today).add(-6, 'month').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).add(-6, 'month').toDate(),
      updated_at: new Date(),
    },
    {
      id: 'rule-2',
      name: 'Freelance Work',
      amount: 800.00,
      type: 'income',
      category: 'other',
      frequency: 'weekly',
      recurrence_day: 5, // Friday
      start_date: dayjs(today).add(-4, 'week').toDate(),
      end_date: null,
      is_active: true,
      created_at: dayjs(today).add(-4, 'week').toDate(),
      updated_at: new Date(),
    },
    
    // Fixed Expenses
    {
      id: 'rule-3',
      name: 'Rent',
      amount: 1500.00,
      type: 'expense',
      category: 'housing',
      frequency: 'monthly',
      recurrence_day: 1,
      start_date: dayjs(today).add(-6, 'month').toDate(),
      end_date: null,
      is_active: true,
      created_at: new Date(dayjs(today).add(-6, 'month').toDate()),
      updated_at: new Date(),
    },
    {
      id: 'rule-4',
      name: 'Car Payment',
      amount: 450.00,
      type: 'expense',
      category: 'transport',
      frequency: 'monthly',
      recurrence_day: 15,
      start_date: dayjs(today).add(-12, 'month').toDate(),
      end_date: null,
      is_active: true,
      created_at: new Date(dayjs(today).add(-12, 'month').toDate()),
      updated_at: new Date(),
    },
    
    // Utilities
    {
      id: 'rule-5',
      name: 'Electricity',
      amount: 120.00,
      type: 'expense',
      category: 'utilities',
      frequency: 'monthly',
      recurrence_day: 5,
      start_date: dayjs(today).add(-6, 'month').toDate(),
      end_date: null,
      is_active: true,
      created_at: new Date(dayjs(today).add(-6, 'month').toDate()),
      updated_at: new Date(),
    },
    {
      id: 'rule-6',
      name: 'Internet',
      amount: 80.00,
      type: 'expense',
      category: 'utilities',
      frequency: 'monthly',
      recurrence_day: 10,
      start_date: dayjs(today).add(-6, 'month').toDate(),
      end_date: null,
      is_active: true,
      created_at: new Date(dayjs(today).add(-6, 'month').toDate()),
      updated_at: new Date(),
    },
    
    // Subscriptions
    {
      id: 'rule-7',
      name: 'Netflix',
      amount: 15.99,
      type: 'expense',
      category: 'entertainment',
      frequency: 'monthly',
      recurrence_day: 1,
      start_date: dayjs(today).add(-1, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: new Date(dayjs(today).add(-1, 'year').toDate()),
      updated_at: new Date(),
    },
    {
      id: 'rule-8',
      name: 'Spotify Premium',
      amount: 11.99,
      type: 'expense',
      category: 'entertainment',
      frequency: 'monthly',
      recurrence_day: 20,
      start_date: dayjs(today).add(-2, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: new Date(dayjs(today).add(-2, 'year').toDate()),
      updated_at: new Date(),
    },
    {
      id: 'rule-9',
      name: 'Amazon Prime',
      amount: 14.99,
      type: 'expense',
      category: 'entertainment',
      frequency: 'yearly',
      recurrence_day: null,
      start_date: dayjs(today).add(-2, 'year').toDate(),
      end_date: null,
      is_active: true,
      created_at: new Date(dayjs(today).add(-2, 'year').toDate()),
      updated_at: new Date(),
    },
    {
      id: 'rule-10',
      name: 'Cloud Storage',
      amount: 9.99,
      type: 'expense',
      category: 'subscription',
      frequency: 'monthly',
      recurrence_day: 15,
      start_date: dayjs(today).add(-3, 'month').toDate(),
      end_date: null,
      is_active: true,
      created_at: new Date(dayjs(today).add(-3, 'month').toDate()),
      updated_at: new Date(),
    },
  ];
}

function generateSampleTransactions(today: Date): OneTimeTransaction[] {
  return [
    // Past transactions (already happened)
    {
      id: 'trans-1',
      date: dayjs(today).add(-5, 'day').toDate(),
      description: 'Dinner with friends',
      amount: 85.50,
      type: 'expense',
      is_reconciled: true,
      created_at: new Date(dayjs(today).add(-5, 'day').toDate()),
      updated_at: new Date(),
    },
    {
      id: 'trans-2',
      date: dayjs(today).add(-3, 'day').toDate(),
      description: 'Sold old furniture',
      amount: 250.00,
      type: 'income',
      is_reconciled: true,
      created_at: new Date(dayjs(today).add(-3, 'day').toDate()),
      updated_at: new Date(),
    },
    {
      id: 'trans-3',
      date: dayjs(today).add(-2, 'day').toDate(),
      description: 'Gas tank',
      amount: 45.00,
      type: 'expense',
      is_reconciled: true,
      created_at: new Date(dayjs(today).add(-2, 'day').toDate()),
      updated_at: new Date(),
    },
    {
      id: 'trans-4',
      date: dayjs(today).add(-1, 'day').toDate(),
      description: 'Groceries',
      amount: 120.00,
      type: 'expense',
      is_reconciled: true,
      created_at: new Date(dayjs(today).add(-1, 'day').toDate()),
      updated_at: new Date(),
    },
    
    // Future transactions (planned)
    {
      id: 'trans-5',
      date: dayjs(today).add(5, 'day').toDate(),
      description: 'Birthday party gift',
      amount: 75.00,
      type: 'expense',
      is_reconciled: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'trans-6',
      date: dayjs(today).add(12, 'day').toDate(),
      description: 'Dentist appointment',
      amount: 150.00,
      type: 'expense',
      is_reconciled: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'trans-7',
      date: dayjs(today).add(20, 'day').toDate(),
      description: 'Car maintenance',
      amount: 200.00,
      type: 'expense',
      is_reconciled: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'trans-8',
      date: dayjs(today).add(25, 'day').toDate(),
      description: 'Freelance project payment',
      amount: 500.00,
      type: 'income',
      is_reconciled: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'trans-9',
      date: dayjs(today).add(30, 'day').toDate(),
      description: 'Vacation flight',
      amount: 350.00,
      type: 'expense',
      is_reconciled: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'trans-10',
      date: dayjs(today).add(60, 'day').toDate(),
      description: 'Holiday shopping',
      amount: 400.00,
      type: 'expense',
      is_reconciled: false,
      created_at: new Date(),
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
    totalIncome: data.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: data.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
  };
}
