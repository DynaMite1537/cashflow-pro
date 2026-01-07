import dayjs from 'dayjs';
import { BudgetRule, OneTimeTransaction, DailySimulationResult, SimulationTransaction } from '@/types';
import { matchesRecurrence } from './dateUtils';

/**
 * Run financial simulation for a given period
 * @param currentBalance - Starting balance
 * @param rules - Recurring budget rules
 * @param oneOffs - One-time transactions
 * @param checkpoints - Manual balance adjustments (date ISO string -> balance)
 * @param daysToProject - Number of days to simulate (default: 90)
 * @returns Array of daily simulation results
 */
export function runSimulation(
  currentBalance: number,
  rules: BudgetRule[],
  oneOffs: OneTimeTransaction[],
  checkpoints: Record<string, number>,
  daysToProject: number = 90
): DailySimulationResult[] {
  const results: DailySimulationResult[] = [];
  let runningBalance = currentBalance;
  const startDate = new Date();

  // Calculate the minimum balance for highlighting danger zones
  let minimumBalance = currentBalance;
  const minimumBalanceDates: string[] = [toISODate(startDate)];

  for (let day = 0; day < daysToProject; day++) {
    const currentDate = dayjs(startDate).add(day, 'day').toDate();
    const dateStr = toISODate(currentDate);
    const startingBalance = runningBalance;

    // 1. Check if this date has a checkpoint (Reality Anchor)
    if (checkpoints[dateStr] !== undefined) {
      runningBalance = checkpoints[dateStr];
      
      // Track minimum balance
      if (runningBalance < minimumBalance) {
        minimumBalance = runningBalance;
        minimumBalanceDates.length = 0;
        minimumBalanceDates.push(dateStr);
      } else if (runningBalance === minimumBalance) {
        minimumBalanceDates.push(dateStr);
      }

      // For checkpoint days, we don't apply transactions - the balance is final
      results.push({
        date: dateStr,
        startingBalance: runningBalance,
        transactions: [],
        netChange: 0,
        endingBalance: runningBalance,
        isCheckpoint: true,
        isLowestPoint: minimumBalanceDates.includes(dateStr),
      });
      continue;
    }

    // 2. Find matching recurring rules
    const dailyRules = rules.filter(rule => 
      matchesRecurrence(currentDate, rule)
    );

    // 3. Find matching one-off transactions
    const dailyOneOffs = oneOffs.filter(t => {
      const transactionDate = toISODate(new Date(t.date));
      return transactionDate === dateStr;
    });

    // 4. Combine all transactions
    const transactions: SimulationTransaction[] = [
      ...dailyRules.map(r => ({
        name: r.name,
        amount: r.amount,
        type: r.type,
        source: 'rule' as const,
        ruleId: r.id,
      })),
      ...dailyOneOffs.map(t => ({
        name: t.description || 'One-time Transaction',
        amount: t.amount,
        type: t.type,
        source: 'one-time' as const,
      })),
    ];

    // 5. Calculate net change
    const netChange = transactions.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);

    // 6. Update running balance
    runningBalance += netChange;

    // Track minimum balance
    if (runningBalance < minimumBalance) {
      minimumBalance = runningBalance;
      minimumBalanceDates.length = 0;
      minimumBalanceDates.push(dateStr);
    } else if (runningBalance === minimumBalance) {
      minimumBalanceDates.push(dateStr);
    }

    results.push({
      date: dateStr,
      startingBalance,
      transactions,
      netChange,
      endingBalance: runningBalance,
      isCheckpoint: false,
      isLowestPoint: minimumBalanceDates.includes(dateStr),
    });
  }

  return results;
}

/**
 * Find the date where balance will be lowest (potential overdraft)
 */
export function findOverdraftDate(simulationResults: DailySimulationResult[]): Date | null {
  const negativeDay = simulationResults.find(r => r.endingBalance < 0);
  return negativeDay ? new Date(negativeDay.date) : null;
}

/**
 * Find the lowest projected balance (even if positive)
 */
export function findLowestBalance(simulationResults: DailySimulationResult[]): {
  date: string;
  balance: number;
} | null {
  let lowest: { date: string; balance: number } | null = null;

  for (const result of simulationResults) {
    if (!lowest || result.endingBalance < lowest.balance) {
      lowest = {
        date: result.date,
        balance: result.endingBalance,
      };
    }
  }

  return lowest;
}

/**
 * Count how many days until potential overdraft
 */
export function getDaysUntilOverdraft(simulationResults: DailySimulationResult[]): number | null {
  for (let i = 0; i < simulationResults.length; i++) {
    if (simulationResults[i].endingBalance < 0) {
      return i;
    }
  }
  return null;
}

/**
 * Get summary statistics for the simulation
 */
export function getSimulationStats(simulationResults: DailySimulationResult[]) {
  const totalIncome = simulationResults.reduce(
    (sum, r) => 
      sum + r.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    0
  );

  const totalExpenses = simulationResults.reduce(
    (sum, r) => 
      sum + r.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    0
  );

  const finalBalance = simulationResults[simulationResults.length - 1]?.endingBalance || 0;
  const lowestPoint = findLowestBalance(simulationResults);
  const overdraftDays = getDaysUntilOverdraft(simulationResults);

  return {
    totalIncome,
    totalExpenses,
    netChange: totalIncome - totalExpenses,
    finalBalance,
    lowestBalance: lowestPoint?.balance || 0,
    lowestBalanceDate: lowestPoint?.date || null,
    daysUntilOverdraft: overdraftDays,
    hasOverdraft: overdraftDays !== null,
  };
}

/**
 * Convert Date to ISO date string (YYYY-MM-DD)
 */
function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}
