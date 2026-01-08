'use client';

import { Trash2 } from 'lucide-react';
import { CreditCardPayment, CreditCard } from '@/types';

export interface PaymentRowDataProps {
  payments: CreditCardPayment[];
  creditCards: CreditCard[];
  getCardName: (cardId: string) => string;
  getCardColor: (cardId: string) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  onDelete: (paymentId: string, amount: number, cardId: string) => void;
  onEditPayment?: (payment: CreditCardPayment) => void;
}

export function PaymentRow({
  index,
  style,
  payments,
  creditCards,
  getCardName,
  getCardColor,
  formatCurrency,
  formatDate,
  onDelete,
  onEditPayment,
}: {
  index: number;
  style: React.CSSProperties;
} & PaymentRowDataProps) {
  const payment = payments[index];

  return (
    <div style={style} className="hover:bg-muted/50 transition-colors border-b border-border">
      <div className="flex items-center px-6 py-4">
        {/* Date */}
        <div className="flex-1 min-w-[120px] text-sm text-foreground whitespace-nowrap">
          {formatDate(payment.paymentDate)}
        </div>

        {/* Card */}
        <div className="flex-1 min-w-[150px]">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getCardColor(payment.cardId) }}
            />
            <span className="text-sm text-foreground truncate">{getCardName(payment.cardId)}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="flex-1 min-w-[100px] text-right">
          <span className="text-sm font-medium text-green-600">
            -{formatCurrency(payment.amount)}
          </span>
        </div>

        {/* Notes */}
        <div className="flex-[2] min-w-[200px]">
          <p className="text-sm text-muted-foreground truncate">
            {payment.notes || '-'}
          </p>
        </div>

        {/* Actions */}
        <div className="w-16 flex-shrink-0">
          <button
            onClick={() => onDelete(payment.id, payment.amount, payment.cardId)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            title="Delete payment"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
