import { useEffect, useRef } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useDebounce } from 'use-debounce';
import { SaveStatus } from '@/types';

/**
 * Hook that automatically saves state to backend with debouncing
 * Watches state changes and triggers API calls after debounce period (1 second)
 */
export function useAutoSave() {
  const { currentBalance, rules, transactions, checkpoints, setSaveStatus } = useBudgetStore();

  // Debounce data - only save after 1 second of no changes
  const [debouncedData] = useDebounce({ currentBalance, rules, transactions, checkpoints }, 1000);

  // Track if we're currently saving to prevent overlapping saves
  const isSavingRef = useRef(false);

  useEffect(() => {
    const saveData = async () => {
      // Prevent overlapping saves
      if (isSavingRef.current) {
        return;
      }

      isSavingRef.current = true;
      setSaveStatus('saving');

      try {
        // TODO: Replace with actual API calls
        // await api.saveBudgetData(debouncedData);

        console.log('Auto-saving data:', debouncedData);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setSaveStatus('saved');

        // Reset to 'idle' after showing 'saved' for a moment
        setTimeout(() => {
          setSaveStatus('idle');
          isSavingRef.current = false;
        }, 1500);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus('error');
        isSavingRef.current = false;
      }
    };

    // Only save if we have debounced data
    if (debouncedData) {
      saveData();
    }
  }, [debouncedData, setSaveStatus]);
}

/**
 * Hook to check if data has unsaved changes
 * Compares current state with last saved state
 */
export function useUnsavedChanges(): boolean {
  const saveStatus = useBudgetStore((state) => state.saveStatus);

  return saveStatus === 'saving';
}

/**
 * Get current save status for UI display
 */
export function useSaveStatusDisplay(): {
  status: SaveStatus;
  message: string;
} {
  const saveStatus = useBudgetStore((state) => state.saveStatus);

  const statusMessages: Record<SaveStatus, string> = {
    idle: 'All changes saved',
    saving: 'Saving...',
    saved: 'Saved',
    error: 'Save failed',
  };

  return {
    status: saveStatus,
    message: statusMessages[saveStatus],
  };
}
