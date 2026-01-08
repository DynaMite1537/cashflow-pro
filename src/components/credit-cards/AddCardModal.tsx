'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { CreditCard, CreditCardInput } from '@/types';
import { cn } from '@/lib/utils';

interface AddCardModalProps {
  isOpen: boolean;
  card?: CreditCard | null;
  onClose: () => void;
}

const cardColors = [
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Gray', value: '#6b7280' },
];

export function AddCardModal({ isOpen, card, onClose }: AddCardModalProps) {
  const { addCreditCard, updateCreditCard } = useBudgetStore();

  // Form state
  const [name, setName] = useState(card?.name || '');
  const [last4, setLast4] = useState(card?.last4 || '');
  const [balance, setBalance] = useState(card?.balance || 0);
  const [limit, setLimit] = useState(card?.limit || 0);
  const [dueDate, setDueDate] = useState(
    card?.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''
  );
  const [color, setColor] = useState(card?.color || cardColors[0].value);
  const [isActive, setIsActive] = useState(card?.isActive ?? true);

  // Reset form when card prop changes
  useEffect(() => {
    if (card) {
      setName(card.name || '');
      setLast4(card.last4 || '');
      setBalance(card.balance || 0);
      setLimit(card.limit || 0);
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
      setColor(card.color || cardColors[0].value);
      setIsActive(card.isActive ?? true);
    } else {
      // Reset to defaults when closing or opening new card modal
      setName('');
      setLast4('');
      setBalance(0);
      setLimit(0);
      setDueDate('');
      setColor(cardColors[0].value);
      setIsActive(true);
    }
  }, [card, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a card name');
      return;
    }

    if (!/^\d{4}$/.test(last4)) {
      alert('Please enter last 4 digits (numbers only)');
      return;
    }

    if (balance < 0 || limit < 0) {
      alert('Balance and limit must be positive numbers');
      return;
    }

    if (!dueDate) {
      alert('Please select a due date');
      return;
    }

    const cardData: CreditCardInput = {
      name: name.trim(),
      last4: last4.trim(),
      balance: Number(balance),
      limit: Number(limit),
      dueDate: new Date(dueDate),
      color: color,
      isActive,
    };

    if (card?.id) {
      updateCreditCard(card.id, cardData);
    } else {
      addCreditCard(cardData);
    }
    onClose();
  };

  return (
    isOpen && (
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">
              {card ? 'Edit Credit Card' : 'Add New Credit Card'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Card Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Card Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Chase Sapphire, Amex Gold"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                required
              />
            </div>

            {/* Last 4 Digits */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Last 4 Digits
              </label>
              <input
                type="text"
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                maxLength={4}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground font-mono"
                required
              />
            </div>

            {/* Balance & Limit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Current Balance
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground font-mono"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Credit Limit
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value) || 0)}
                    placeholder="5000.00"
                    step="100"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Next Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                required
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Card Color</label>
              <div className="flex gap-3">
                {cardColors.map((colorOption) => (
                  <button
                    key={colorOption.name}
                    type="button"
                    onClick={() => setColor(colorOption.value)}
                    className={cn(
                      'w-10 h-10 rounded-full border-2 transition-transform hover:scale-110',
                      color === colorOption.value
                        ? 'border-ring-offset-2 ring-2 ring-primary ring-offset-2'
                        : 'border-border hover:border-muted'
                    )}
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <span className="text-sm font-medium text-foreground">Active Card</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                {card ? 'Update Card' : 'Add Credit Card'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-muted text-muted-foreground px-6 py-3 rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}
