'use client';

import { useState } from 'react';
import { X, DollarSign, CreditCard as CreditCardIcon, Calendar, FileText } from 'lucide-react';
import { CreditCardPaymentInput, CreditCard } from '@/types';
import { useBudgetStore } from '@/store/useBudgetStore';

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCardId?: string;
}

export function PaymentForm({ isOpen, onClose, preselectedCardId }: PaymentFormProps) {
  const { creditCards, addPayment } = useBudgetStore();
  const [cardId, setCardId] = useState(preselectedCardId || '');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardId) {
      alert('Please select a credit card');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    const card = creditCards.find(c => c.id === cardId);
    if (!card) {
      alert('Selected card not found');
      return;
    }

    const paymentData: CreditCardPaymentInput = {
      cardId,
      amount: Number(amount),
      paymentDate: new Date(paymentDate),
      notes: notes.trim(),
      updated_at: new Date(),
    };

    addPayment(paymentData);
    onClose();
  };

  const handleFullPayment = () => {
    if (!cardId) return;
    const card = creditCards.find(c => c.id === cardId);
    if (card) {
      setAmount(card.balance.toString());
    }
  };

  const activeCards = creditCards.filter(c => c.isActive);

  return (
    isOpen && (
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Record Payment</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Card Selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Credit Card
              </label>
              <div className="relative">
                <CreditCardIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground appearance-none cursor-pointer"
                  required
                >
                  <option value="">Choose a card...</option>
                  {activeCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} (•••• {card.last4}) - Balance: ${card.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>
              {activeCards.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No active credit cards found. Add a card first.
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Amount
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full pl-12 pr-20 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground font-mono"
                  required
                />
                {cardId && (
                  <button
                    type="button"
                    onClick={handleFullPayment}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded hover:bg-primary/90 transition-colors"
                  >
                    Full
                  </button>
                )}
              </div>
              {cardId && amount && (
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">
                    Remaining balance: ${(
                      (creditCards.find(c => c.id === cardId)?.balance || 0) - Number(amount)
                    ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Date
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes (Optional)
              </label>
              <div className="relative">
                <FileText size={18} className="absolute left-4 top-4 text-muted-foreground" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this payment..."
                  rows={3}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground resize-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Record Payment
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
