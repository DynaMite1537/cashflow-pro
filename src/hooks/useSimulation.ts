import { useMemo, useCallback } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { runSimulation, getSimulationStats } from '@/lib/simulation';
import { DailySimulationResult } from '@/types';

interface UseSimulationOptions {
  daysToProject?: number;
}

interface UseSimulationReturn {
  simulation: DailySimulationResult[];
  stats: ReturnType<typeof getSimulationStats>;
  isLoading: boolean;
}

/**
 * Hook to run financial simulation based on current state
 * Automatically re-calculates when rules, transactions, checkpoints, or balance change
 */
export function useSimulation(options: UseSimulationOptions = {}): UseSimulationReturn {
  // Use shallow selector to prevent unnecessary re-renders
  const state = useBudgetStore();
  const currentBalance = state.currentBalance;
  const rules = state.rules;
  const transactions = state.transactions;
  const checkpoints = state.checkpoints;
  const { daysToProject = 90 } = options;

  // Memoize checkpoint conversion - only re-run when checkpoints change
  const checkpointMap = useMemo(() => {
    const map: Record<string, number> = {};
    Object.entries(checkpoints).forEach(([date, balance]) => {
      map[date] = balance;
    });
    return map;
  }, [checkpoints]);

  // Memoize simulation calculation - only re-run when dependencies change
  const simulation = useMemo(() => {
    return runSimulation(
      currentBalance,
      rules,
      transactions,
      checkpointMap,
      daysToProject
    );
  }, [currentBalance, rules, transactions, checkpointMap, daysToProject]);

  // Memoize stats calculation - only re-run when simulation changes
  const stats = useMemo(() => {
    return getSimulationStats(simulation);
  }, [simulation]);

  return {
    simulation,
    stats,
    isLoading: false, // Could add loading state if simulation is async
  };
}

/**
 * Hook to get only simulation results
 * Memoized to prevent unnecessary re-calculations
 */
export function useSimulationResults(): DailySimulationResult[] {
  return useSimulation().simulation;
}

/**
 * Hook to get simulation statistics
 * Memoized to prevent unnecessary re-calculations
 */
export function useSimulationStats() {
  return useSimulation().stats;
}
