'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, RotateCcw, ArrowLeft } from 'lucide-react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { BudgetRule, OneTimeTransaction, TransactionType } from '@/types';
import { toastSuccess, toastError } from '@/lib/toast';
import dayjs from 'dayjs';

interface DayEditModalProps {
  date: Date;
  events: Array<{
    type: 'transaction' | 'rule';
    name: string;
    amount: number;
    transactionType: 'income' | 'expense';
    id: string;
    ruleId?: string;
    isOverride?: boolean;
    originalAmount?: number;
  }>;
  onClose: () => void;
  onBack?: () => void;
}

export function DayEditModal({ date, events, onClose, onBack }: DayEditModalProps) {
  const { rules, transactions, addTransaction, updateTransaction, deleteTransaction } = useBudgetStore();

  // State to track edits
  const [edits, setEdits] = useState<Record<string, number>>({});

  // State for adding new transaction
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
  });

  // Helper to find if an override exists for a rule
  const findOverrideForRule = (ruleId: string): OneTimeTransaction | null => {
    const dayStr = dayjs(date).format('YYYY-MM-DD');
    return transactions.find(t =>
      t.is_override &&
      t.override_rule_id === ruleId &&
      dayjs(t.date).format('YYYY-MM-DD') === dayStr
    ) || null;
  };

  // Initialize edits with current amounts
  useEffect(() => {
    const initialEdits: Record<string, number> = {};
    events.forEach(event => {
      if (event.isOverride && event.ruleId) {
        // This is an override transaction - event.id is the override tx ID, ruleId is the original rule ID
        initialEdits[event.id] = event.amount;
      } else if (event.type === 'rule') {
        // This is a regular rule (not overridden)
        const override = findOverrideForRule(event.id);
        initialEdits[event.id] = override ? override.amount : event.amount;
      } else {
        // Regular transaction
        initialEdits[event.id] = event.amount;
      }
    });
    setEdits(initialEdits);
  }, [events]);

  const handleAmountChange = (eventId: string, value: number) => {
    setEdits(prev => ({ ...prev, [eventId]: value }));
  };

  const handleRemoveOverride = (ruleId: string) => {
    const override = findOverrideForRule(ruleId);
    if (override) {
      deleteTransaction(override.id);
      toastSuccess('Override removed', 'Original rule amount will be used');
      // Revert to original amount in edits
      const rule = rules.find(r => r.id === ruleId);
      if (rule) {
        setEdits(prev => ({ ...prev, [ruleId]: rule.amount }));
      }
    }
  };

  const handleSave = () => {
    try {
      events.forEach(event => {
        const newAmount = edits[event.id];

        // If this is an override transaction, use the original rule ID for lookups
        const targetRuleId = event.isOverride && event.ruleId ? event.ruleId : event.id;

        if (event.type === 'rule' || event.isOverride) {
          // Handle rule - create or update override
          const override = findOverrideForRule(targetRuleId);
          const rule = rules.find(r => r.id === targetRuleId);

          if (rule) {
            if (override) {
              // Update existing override
              updateTransaction(override.id, { amount: newAmount });
            } else {
              // Create new override only if amount is different
              if (newAmount !== rule.amount) {
                addTransaction({
                  date: date,
                  description: `${rule.name} (Override)`,
                  amount: newAmount,
                  type: rule.type,
                  is_reconciled: false,
                  override_rule_id: rule.id,
                  is_override: true,
                });
              }
            }
          }
        } else {
          // Update regular transaction
          updateTransaction(event.id, { amount: newAmount });
        }
      });

      toastSuccess('Changes saved', 'Your adjustments have been saved');
      onClose();
    } catch (error) {
      toastError('Error', 'Failed to save changes');
      console.error('Failed to save changes:', error);
    }
  };

  const handleDeleteTransaction = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event && event.type === 'transaction' && !event.isOverride) {
      if (confirm('Are you sure you want to delete this transaction?')) {
        deleteTransaction(eventId);
        toastSuccess('Transaction deleted');
        onClose();
      }
    }
  };

  const handleAddTransaction = () => {
    try {
      if (newTransaction.description && newTransaction.amount) {
        addTransaction({
          date: date,
          description: newTransaction.description,
          amount: parseFloat(newTransaction.amount),
          type: newTransaction.type,
          is_reconciled: false,
        });
        toastSuccess('Transaction added', `"${newTransaction.description}" has been added`);
        setNewTransaction({
          description: '',
          amount: '',
          type: 'expense',
        });
        setShowAddForm(false);
      }
    } catch (error) {
      toastError('Error', 'Failed to add transaction');
      console.error('Failed to add transaction:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-card text-card-foreground rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="p-6">
           {/* Header */}
           <div className="flex items-center justify-between mb-6">
             <div>
               <button
                 onClick={onBack}
                 className="p-2 hover:bg-muted rounded-lg transition-colors"
                 title="Go back"
               >
                 <ArrowLeft size={20} />
               </button>
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <Pencil size={20} />
                 Edit Day: {dayjs(date).format('MMM D, YYYY')}
               </h3>
               <p className="text-muted-foreground text-sm mt-1">
                 Adjust amounts for transactions and rules
               </p>
             </div>
             <button
               onClick={onClose}
               className="p-2 hover:bg-muted rounded-lg transition-colors"
             >
               <X size={20} />
             </button>
           </div>

          {/* Events List */}
          <div className="space-y-3">
            {events.map(event => {
              const isRule = event.type === 'rule';
              const isOverrideTransaction = event.isOverride;
              const currentAmount = edits[event.id] || 0;
              const isIncome = event.transactionType === 'income';

              // Determine if this event has an override
              let hasOverride = false;
              let override = null;

              if (isOverrideTransaction && event.ruleId) {
                // This event IS an override transaction
                hasOverride = true;
                override = transactions.find(t => t.id === event.id && t.is_override) || null;
              } else if (isRule) {
                // Regular rule - check if it has an override
                override = findOverrideForRule(event.id);
                hasOverride = !!override;
              }

              return (
                <div
                  key={event.id}
                  className="bg-muted/30 border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Event Name */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium truncate ${isIncome ? 'text-emerald-600' : 'text-destructive'}`}>
                          {event.name}
                        </span>
                        {isRule && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Recurring
                          </span>
                        )}
                        {isOverrideTransaction && (
                          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                            Override
                          </span>
                        )}
                      </div>

                      {/* Amount Input */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={currentAmount || ''}
                            onChange={(e) => handleAmountChange(event.id, parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input"
                          />
                        </div>
                      </div>

                      {/* Override Info */}
                      {((isRule && hasOverride) || isOverrideTransaction) && (
                        <div className="text-xs text-muted-foreground mt-2">
                          {isOverrideTransaction && event.originalAmount ? (
                            <span className="line-through mr-2">${event.originalAmount.toFixed(2)}</span>
                          ) : (
                            <span className="line-through mr-2">${event.amount.toFixed(2)}</span>
                          )}
                          <span className="text-emerald-600">→ ${currentAmount.toFixed(2)}</span>
                          <span className="ml-2">(original rule amount)</span>
                        </div>
                      )}

                      {isRule && !hasOverride && !isOverrideTransaction && currentAmount !== event.amount && (
                        <div className="text-xs text-amber-600 mt-2">
                          Will create override for this day
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-start gap-2">
                      {((isRule && hasOverride) || isOverrideTransaction) && (
                        <button
                          onClick={() => handleRemoveOverride(event.ruleId || event.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-amber-700 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 rounded-md transition-colors"
                          title="Remove override and use original amount"
                        >
                          <RotateCcw size={12} />
                          Reset
                        </button>
                      )}
                      {!isRule && !isOverrideTransaction && (
                        <button
                          onClick={() => handleDeleteTransaction(event.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {events.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No transactions or rules for this day
              </div>
            )}

          {/* Add New Transaction Form */}
          <div className="border-t border-border pt-6 mt-6">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-lg transition-all text-muted-foreground hover:text-foreground"
              >
                <Plus size={18} />
                <span>Add New Transaction</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">New Transaction</h4>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTransaction({
                        description: '',
                        amount: '',
                        type: 'expense',
                      });
                    }}
                    className="p-1 hover:bg-muted rounded-md transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Type Selection */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTransaction(prev => ({ ...prev, type: 'income' }))}
                    className={`flex-1 py-2 px-4 rounded-md border transition-colors text-sm ${
                      newTransaction.type === 'income'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransaction(prev => ({ ...prev, type: 'expense' }))}
                    className={`flex-1 py-2 px-4 rounded-md border transition-colors text-sm ${
                      newTransaction.type === 'expense'
                        ? 'bg-destructive text-white border-destructive'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    Expense
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Grocery shopping"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input text-sm"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input text-sm"
                    />
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddTransaction}
                  disabled={!newTransaction.description || !newTransaction.amount}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                  Add Transaction
                </button>
              </div>
            )}
          </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-border">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Cancel
            </button>
          </div>

          {/* Helper Text */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Editing a recurring rule creates a one-time override for this day only.
              The original rule amount will be used on other days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
