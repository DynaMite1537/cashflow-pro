// ============== Frequency Types ==============
export type Frequency = 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';

// ============== Category Types ==============
export type Category =
  | 'housing'
  | 'transport'
  | 'utilities'
  | 'food'
  | 'entertainment'
  | 'debt'
  | 'subscription'
  | 'other';

// ============== Transaction Types ==============
export type TransactionType = 'income' | 'expense';

// ============== Budget Rule ==============
export interface BudgetRule {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: Category;
  frequency: Frequency;
  recurrence_day: number | null;
  start_date: Date;
  end_date: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Input type for creating/updating budget rules (without auto-generated fields)
export type BudgetRuleInput = Omit<BudgetRule, 'id' | 'created_at' | 'updated_at'>;

// ============== One-Time Transaction ==============
export interface OneTimeTransaction {
  id: string;
  date: Date;
  description: string | null;
  amount: number;
  type: TransactionType;
  is_reconciled: boolean;
  created_at: Date;
  updated_at: Date;
  // Override fields for calendar adjustments to recurring rules
  override_rule_id?: string | null; // Links to the rule being overridden
  is_override?: boolean; // Flag to identify override transactions
}

export type OneTimeTransactionInput = Omit<OneTimeTransaction, 'id' | 'created_at' | 'updated_at'>;

// ============== Balance Checkpoint ==============
export interface BalanceCheckpoint {
  id: string;
  date: Date;
  balance: number;
  notes: string | null;
  created_at: Date;
}

export type BalanceCheckpointInput = Omit<BalanceCheckpoint, 'id' | 'created_at'>;

// ============== Simulation Result ==============
export interface SimulationTransaction {
  name: string;
  amount: number;
  type: TransactionType;
  source: 'rule' | 'one-time' | 'override';
  ruleId?: string;
  isOverride?: boolean; // Flag to identify override transactions in simulation
}

export interface DailySimulationResult {
  date: string;
  startingBalance: number;
  transactions: SimulationTransaction[];
  netChange: number;
  endingBalance: number;
  isCheckpoint: boolean;
  isLowestPoint: boolean;
  hasOverride?: boolean; // Flag to indicate this day has manual adjustments
}

// ============== User Profile ==============
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: Date;
  updated_at: Date;
}

// ============== API Response Types ==============
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface ApiError {
  message: string;
  details?: unknown;
}

// ============== Store State ==============
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AppState {
  currentBalance: number;
  rules: BudgetRule[];
  transactions: OneTimeTransaction[];
  checkpoints: Record<string, number>; // ISO date string -> balance
  saveStatus: SaveStatus;
}

// ============== UI Props Types ==============
export interface FilterType {
  type: 'all' | 'income' | 'expense' | 'active' | 'inactive';
}

// ============== Credit Card Types ==============
export interface CreditCard {
  id: string;
  name: string; // "Chase Sapphire", "Amex Gold"
  last4: string; // Last 4 digits: "1234"
  balance: number; // Current balance owed
  limit: number; // Credit limit
  dueDate: Date; // Specific next due date
  color?: string; // Card identification color
  annualFee?: number; // Optional annual fee
  isActive: boolean; // Toggle tracking on/off
  created_at: Date;
  updated_at: Date;
}

export type CreditCardInput = Omit<CreditCard, 'id' | 'created_at' | 'updated_at'>;

export interface CreditCardPayment {
  id: string;
  cardId: string;
  amount: number;
  paymentDate: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export type CreditCardPaymentInput = Omit<CreditCardPayment, 'id' | 'created_at'>;

// ============== Calendar Event Types ==============
export interface CalendarEvent {
  type: 'transaction' | 'rule';
  name: string;
  amount: number;
  transactionType: 'income' | 'expense';
  id: string;
  ruleId?: string;
  isOverride?: boolean;
  originalAmount?: number;
}
