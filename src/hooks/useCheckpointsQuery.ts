'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BalanceCheckpoint } from '@/types';

const QUERY_KEYS = {
  budgetRules: ['budgetRules'] as const,
  transactions: ['transactions'] as const,
  checkpoints: ['checkpoints'] as const,
};

/**
 * Fetch all checkpoints from API
 */
export function useCheckpointsQuery() {
  return useQuery<BalanceCheckpoint[]>({
    queryKey: QUERY_KEYS.checkpoints,
    queryFn: async () => {
      const response = await fetch('/api/checkpoints');
      if (!response.ok) {
        throw new Error('Failed to fetch checkpoints');
      }
      return response.json();
    },
  });
}

/**
 * Create new checkpoint mutation
 */
export function useCreateCheckpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checkpoint: Partial<BalanceCheckpoint>) => {
      const response = await fetch('/api/checkpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkpoint),
      });
      if (!response.ok) {
        throw new Error('Failed to create checkpoint');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checkpoints });
    },
  });
}

/**
 * Delete checkpoint mutation
 */
export function useDeleteCheckpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/checkpoints/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete checkpoint');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checkpoints });
    },
  });
}
