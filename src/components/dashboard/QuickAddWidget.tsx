'use client';

import { useState, memo } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { useBudgetStore } from '@/store/useBudgetStore';

export const QuickAddWidget = memo(function QuickAddWidget() {
  const addTransaction = useBudgetStore((state) => state.addTransaction);
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-card hover:bg-accent border border-border hover:border-accent-foreground/20 text-card-foreground shadow-sm py-3 rounded-md text-sm font-medium transition-all"
      >
        + Add Transaction
      </button>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) return;

    addTransaction({
      date: new Date(),
      description: description || (type === 'income' ? 'Quick income' : 'Quick expense'),
      amount: numAmount,
      type: type,
      is_reconciled: false,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setIsOpen(false);
  };

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="flex border-b border-border">
        <button
          onClick={() => setType('income')}
          className={`flex-1 py-3 text-sm font-medium bg-muted/50 text-muted-foreground hover:bg-background border-r border-border transition-colors flex items-center justify-center gap-2 ${
            type === 'income' ? 'bg-background border-b-2 border-primary' : ''
          }`}
        >
          <Plus size={16} className={type === 'income' ? 'text-emerald-600' : ''} />
          Income
        </button>
        <button
          onClick={() => setType('expense')}
          className={`flex-1 py-3 text-sm font-medium bg-muted/50 text-muted-foreground hover:bg-background transition-colors flex items-center justify-center gap-2 ${
            type === 'expense' ? 'bg-background border-b-2 border-primary' : ''
          }`}
        >
          <Minus size={16} className={type === 'expense' ? 'text-destructive' : ''} />
          Expense
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Amount */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground font-mono">$</span>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-input/50 border border-input rounded-md py-2 pl-8 pr-3 text-sm focus:ring-2 focus:ring-ring focus:border-input transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
            What was it?
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Sold old bike, Birthday money..."
            className="w-full bg-input/50 border border-input rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-ring focus:border-input transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 py-2 rounded-md border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 shadow-md transition-all active:scale-[0.98]"
          >
            Add to Forecast
          </button>
        </div>
      </form>
    </div>
  );
});
