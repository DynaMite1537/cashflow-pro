'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OneTimeTransaction } from '@/types';

const QUERY_KEYS = {
  budgetRules: ['budgetRules'] as const,
  transactions: ['transactions'] as const,
  checkpoints: ['checkpoints'] as const,
};

/**
 * Fetch all transactions from API
 */
export function useTransactionsQuery() {
  return useQuery<OneTimeTransaction[]>({
    queryKey: QUERY_KEYS.transactions,
    queryFn: async () => {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return response.json();
    },
  });
}

/**
 * Create new transaction mutation
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Partial<OneTimeTransaction>) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
    },
  });
}

/**
 * Delete transaction mutation
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
    },
  });
}
