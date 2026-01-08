import dayjs from 'dayjs';
import { BudgetRule, Frequency } from '@/types';
import { FREQUENCY_LABELS } from '@/lib/constants';

/**
 * Check if a date matches a recurring rule
 * @param targetDate - The date to check against
 * @param rule - The budget rule definition
 * @returns true if the rule applies on targetDate
 */
export function matchesRecurrence(
  targetDate: Date,
  rule: Pick<BudgetRule, 'frequency' | 'recurrence_day' | 'start_date' | 'end_date' | 'is_active'>
): boolean {
  if (!rule.is_active) return false;

  const startDate = new Date(rule.start_date);

  // Before start date
  if (targetDate < startDate) return false;

  // After end date (if set)
  if (rule.end_date && targetDate > new Date(rule.end_date)) return false;

  switch (rule.frequency) {
    case 'weekly':
      return matchesWeekly(targetDate, rule.recurrence_day ?? 0);

    case 'bi-weekly':
      return matchesBiWeekly(targetDate, startDate);

    case 'monthly':
      return matchesMonthly(targetDate, rule.recurrence_day ?? 1);

    case 'yearly':
      return matchesYearly(targetDate, startDate);

    default:
      return false;
  }
}

/**
 * Check if targetDate matches weekly recurrence
 * recurrence_day: 0=Sunday, 1=Monday, ..., 6=Saturday
 */
function matchesWeekly(targetDate: Date, recurrenceDay: number): boolean {
  // Convert database value (1-7) to JS day (0-6) if needed
  const jsDay = recurrenceDay % 7;
  return targetDate.getDay() === jsDay;
}

/**
 * Check if targetDate matches bi-weekly recurrence
 * Every 14 days from start date
 */
function matchesBiWeekly(targetDate: Date, startDate: Date): boolean {
  const daysSinceStart = dayjs(targetDate).diff(startDate, 'day');
  return daysSinceStart >= 0 && daysSinceStart % 14 === 0;
}

/**
 * Check if targetDate matches monthly recurrence
 * recurrence_day: 1-31 (day of month)
 * Handles end-of-month cases (e.g., 31st falls on 30th in Feb)
 */
function matchesMonthly(targetDate: Date, recurrenceDay: number): boolean {
  const targetDay = targetDate.getDate();
  const monthEnd = dayjs(targetDate).endOf('month').date();

  // If recurrence_day is larger than days in month, use last day
  const effectiveDay = recurrenceDay > monthEnd ? monthEnd : recurrenceDay;

  return targetDay === effectiveDay;
}

/**
 * Check if targetDate matches yearly recurrence
 * Same month and day as start date
 */
function matchesYearly(targetDate: Date, startDate: Date): boolean {
  return (
    dayjs(targetDate).isSame(startDate, 'month') && targetDate.getDate() === startDate.getDate()
  );
}

/**
 * Get all occurrence dates for a rule within a date range
 */
export function getOccurrencesInRange(
  rule: BudgetRule,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  const occurrences: Date[] = [];
  let currentDate = new Date(Math.max(rule.start_date.getTime(), rangeStart.getTime()));

  while (currentDate <= rangeEnd) {
    if (matchesRecurrence(currentDate, rule)) {
      occurrences.push(new Date(currentDate));
    }

    // Move to next potential occurrence
    switch (rule.frequency) {
      case 'weekly':
        currentDate = dayjs(currentDate).add(7, 'day').toDate();
        break;
      case 'bi-weekly':
        currentDate = dayjs(currentDate).add(14, 'day').toDate();
        break;
      case 'monthly':
        currentDate = dayjs(currentDate).add(1, 'month').toDate();
        break;
      case 'yearly':
        currentDate = dayjs(currentDate).add(1, 'year').toDate();
        break;
    }

    // Safety break to prevent infinite loops
    if (occurrences.length > 1000) break;
  }

  return occurrences;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM D, YYYY'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return dayjs(d).format(formatStr);
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get frequency display label
 */
export function getFrequencyLabel(frequency: Frequency): string {
  return FREQUENCY_LABELS[frequency];
}

/**
 * Format amount with +/- sign and color info
 */
export function formatTransactionAmount(amount: number, type: 'income' | 'expense'): {
  text: string;
  isPositive: boolean;
} {
  const formatted = formatCurrency(Math.abs(amount));
  const isIncome = type === 'income';

  return {
    text: isIncome ? `+${formatted}` : `-${formatted}`,
    isPositive: isIncome,
  };
}
