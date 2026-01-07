'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BudgetRule } from '@/types';

const QUERY_KEYS = {
  budgetRules: ['budgetRules'] as const,
  transactions: ['transactions'] as const,
  checkpoints: ['checkpoints'] as const,
};

/**
 * Fetch all budget rules from API
 */
export function useBudgetRules() {
  return useQuery<BudgetRule[]>({
    queryKey: QUERY_KEYS.budgetRules,
    queryFn: async () => {
      const response = await fetch('/api/budget/rules');
      if (!response.ok) {
        throw new Error('Failed to fetch budget rules');
      }
      return response.json();
    },
  });
}

/**
 * Create new budget rule mutation
 */
export function useCreateBudgetRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Partial<BudgetRule>) => {
      const response = await fetch('/api/budget/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      if (!response.ok) {
        throw new Error('Failed to create budget rule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.budgetRules });
    },
  });
}

/**
 * Delete budget rule mutation
 */
export function useDeleteBudgetRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/budget/rules/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete budget rule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.budgetRules });
    },
  });
}
