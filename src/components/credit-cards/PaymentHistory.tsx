'use client';

import { useState } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
import { CreditCardPayment, CreditCard } from '@/types';
import { useBudgetStore } from '@/store/useBudgetStore';
import { List } from 'react-window';
import { PaymentRow, PaymentRowDataProps } from './PaymentRow';

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

      {/* Table Header */}
      <div className="bg-muted px-6 py-3 border-b border-border flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <div className="flex-1 min-w-[120px]">Date</div>
        <div className="flex-1 min-w-[150px]">Card</div>
        <div className="flex-1 min-w-[100px] text-right">Amount</div>
        <div className="flex-[2] min-w-[200px]">Notes</div>
        <div className="w-16"></div>
      </div>

      {/* Virtualized List */}
      {sortedPayments.length === 0 ? (
        <div className="px-6 py-12 text-center text-muted-foreground">
          <p className="text-sm">No payment history found</p>
          <p className="text-xs mt-1">Record your first payment to see it here</p>
        </div>
      ) : (
        <List<PaymentRowDataProps>
          rowComponent={PaymentRow}
          rowCount={sortedPayments.length}
          rowHeight={72}
          rowProps={{
            payments: sortedPayments,
            creditCards,
            getCardName,
            getCardColor,
            formatCurrency,
            formatDate,
            onDelete: handleDelete,
            onEditPayment,
          }}
          style={{ height: Math.min(sortedPayments.length * 72, 600) }}
        />
      )}

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
