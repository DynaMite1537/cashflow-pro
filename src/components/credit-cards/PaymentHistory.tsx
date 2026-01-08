'use client';

import { useState } from 'react';
import { Trash2, Filter, ArrowUpDown } from 'lucide-react';
import { CreditCardPayment, CreditCard } from '@/types';
import { useBudgetStore } from '@/store/useBudgetStore';

interface PaymentHistoryProps {
  onEditPayment?: (payment: CreditCardPayment) => void;
}

export function PaymentHistory({ onEditPayment }: PaymentHistoryProps) {
  const { creditCardPayments, creditCards, deletePayment } = useBudgetStore();
  const [filterCardId, setFilterCardId] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter payments
  const filteredPayments = creditCardPayments.filter((payment) => {
    if (filterCardId === 'all') return true;
    return payment.cardId === filterCardId;
  });

  // Sort payments by date
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const dateA = new Date(a.paymentDate).getTime();
    const dateB = new Date(b.paymentDate).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const getCardName = (cardId: string) => {
    const card = creditCards.find((c) => c.id === cardId);
    return card?.name || 'Unknown Card';
  };

  const getCardColor = (cardId: string) => {
    const card = creditCards.find((c) => c.id === cardId);
    return card?.color || '#6b7280';
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDelete = (paymentId: string, amount: number, cardId: string) => {
    const card = creditCards.find((c) => c.id === cardId);
    if (confirm(`Are you sure you want to delete this ${formatCurrency(amount)} payment to "${card?.name}"?`)) {
      deletePayment(paymentId);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Payment History</h2>
          <span className="text-sm text-muted-foreground">
            {sortedPayments.length} payment{sortedPayments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              value={filterCardId}
              onChange={(e) => setFilterCardId(e.target.value)}
              className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground text-sm"
            >
              <option value="all">All Cards</option>
              {creditCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
          >
            <ArrowUpDown size={16} />
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Card
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Notes
              </th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedPayments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <p className="text-sm">No payment history found</p>
                  <p className="text-xs mt-1">Record your first payment to see it here</p>
                </td>
              </tr>
            ) : (
              sortedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCardColor(payment.cardId) }}
                      />
                      <span className="text-sm text-foreground">{getCardName(payment.cardId)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-green-600">
                      -{formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground max-w-xs truncate">
                      {payment.notes || '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(payment.id, payment.amount, payment.cardId)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete payment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Total paid */}
      {sortedPayments.length > 0 && (
        <div className="px-6 py-4 bg-muted/50 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Paid</span>
            <span className="text-lg font-bold text-green-600">
              -{formatCurrency(sortedPayments.reduce((sum, p) => sum + p.amount, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
