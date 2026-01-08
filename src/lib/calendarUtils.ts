import dayjs from 'dayjs';
import { CalendarEvent, OneTimeTransaction, BudgetRule } from '@/types';
import { matchesRecurrence } from './dateUtils';

/**
 * Get all events (transactions + rules) for a specific date
 * Used by both Forecast and Calendar pages to avoid duplication
 */
export function getEventsForDate(
  date: Date,
  transactions: OneTimeTransaction[],
  rules: BudgetRule[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const dayStr = dayjs(date).format('YYYY-MM-DD');

  // Get all override transactions for this date
  const overrideTransactions = transactions.filter(
    (t) => t.is_override && dayjs(t.date).format('YYYY-MM-DD') === dayStr
  );

  // Track rule IDs that have overrides
  const overriddenRuleIds = new Set(
    overrideTransactions.map((t) => t.override_rule_id).filter(Boolean) as string[]
  );

  // Add one-time transactions (non-override)
  const dayTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return (
      !t.is_override && dayjs(date).isSame(tDate, 'month') && date.getDate() === tDate.getDate()
    );
  });

  dayTransactions.forEach((t) => {
    events.push({
      type: 'transaction',
      name: t.description || 'Transaction',
      amount: t.amount,
      transactionType: t.type,
      id: t.id,
    });
  });

  // Add matching recurring rules (only active and not overridden)
  const matchingRules = rules.filter(
    (rule) => rule.is_active && !overriddenRuleIds.has(rule.id) && matchesRecurrence(date, rule)
  );

  matchingRules.forEach((rule) => {
    // Check if there's an override transaction for this rule
    const overrideTx = overrideTransactions.find((ot) => ot.override_rule_id === rule.id);

    events.push({
      type: 'rule',
      name: rule.name,
      amount: rule.amount,
      transactionType: rule.type,
      id: rule.id,
      ruleId: rule.id,
      isOverride: !!overrideTx,
      originalAmount: overrideTx?.amount,
    });
  });

  return events;
}
