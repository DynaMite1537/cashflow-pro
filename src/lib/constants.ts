// ============== Application Constants ==============

// Pagination
export const ITEMS_PER_PAGE = 25;

// Store / Undo History
export const UNDO_HISTORY_LIMIT = 50;

// Storage Keys
export const STORAGE_KEY = 'cashflow-storage';
export const STORAGE_VERSION = 1;

// ============== Budget Categories ==============

export const BUDGET_CATEGORIES = [
  'housing',
  'transport',
  'utilities',
  'food',
  'entertainment',
  'debt',
  'subscription',
  'other'
] as const;

export type BudgetCategory = typeof BUDGET_CATEGORIES[number];

// ============== Frequencies ==============

export const FREQUENCIES = [
  'weekly',
  'bi-weekly',
  'monthly',
  'yearly'
] as const;

export type Frequency = typeof FREQUENCIES[number];

// Frequency labels for display
export const FREQUENCY_LABELS: Record<Frequency, string> = {
  weekly: 'Weekly',
  'bi-weekly': 'Bi-weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

// ============== Simulation Defaults ==============

export const DEFAULT_DAYS_TO_PROJECT = 90;
export const DEFAULT_START_BALANCE = 0;

// ============== Date Utilities ==============

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

// ============== Category Colors (HSL values) ==============
// These match the CSS variables in globals.css

export const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  housing: '217 91% 60%',
  transport: '217 91% 55%',
  utilities: '142 76% 50%',
  food: '353 78% 60%',
  entertainment: '262 83% 58%',
  debt: '0 0% 50%',
  subscription: '0 0% 50%',
  other: '0 0% 50%',
};

// Lighter variant (10% opacity)
export const CATEGORY_COLORS_LIGHT: Record<BudgetCategory, string> = {
  housing: '217 91% 70%',
  transport: '217 91% 65%',
  utilities: '142 76% 60%',
  food: '353 78% 70%',
  entertainment: '262 83% 70%',
  debt: '0 0% 50%',
  subscription: '0 0% 50%',
  other: '0 0% 50%',
};

// ============== Card Types ==============

export const CREDIT_CARD_TYPES = [
  'visa',
  'mastercard',
  'amex',
  'discover',
  'other'
] as const;

export type CreditCardType = typeof CREDIT_CARD_TYPES[number];

// ============== Validation Defaults ==============

export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 100;
export const MIN_AMOUNT = 0.01;
export const MAX_AMOUNT = 999999999.99;
export const MAX_NOTES_LENGTH = 500;

// ============== API Defaults ==============

export const API_TIMEOUT = 30000; // 30 seconds
export const DEBOUNCE_DELAY = 300; // 300ms for search inputs

// ============== Animation ==============

export const TRANSITION_DURATION = 200; // ms
export const ANIMATION_DURATION = 300; // ms
