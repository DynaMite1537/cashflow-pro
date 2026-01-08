'use client';

import { CreditCard as CreditCardIcon, Edit, Trash2, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { CreditCard as CreditCardType } from '@/types';
import { useBudgetStore } from '@/store/useBudgetStore';

interface CreditCardCardProps {
  card: CreditCardType;
  onEdit: (card: CreditCardType) => void;
  onRecordPayment: (card: CreditCardType) => void;
}

export function CreditCardCard({ card, onEdit, onRecordPayment }: CreditCardCardProps) {
  const { deleteCreditCard } = useBudgetStore();
  const utilization = card.limit > 0 ? (card.balance / card.limit) * 100 : 0;
  const utilizationColor = utilization > 80 ? 'bg-red-500' : utilization > 50 ? 'bg-yellow-500' : 'bg-green-500';

  // Calculate days until due
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(card.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const dueDateUrgency =
    daysUntilDue <= 0
      ? 'text-red-500'
      : daysUntilDue <= 3
        ? 'text-orange-500'
        : daysUntilDue <= 7
          ? 'text-yellow-500'
          : 'text-green-500';

  const cardGradient = `linear-gradient(135deg, ${card.color} 0%, ${card.color}88 100%)`;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Card Visual */}
      <div
        className="p-6 relative overflow-hidden"
        style={{ background: cardGradient }}
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-white drop-shadow-lg">{card.name}</h3>
              <p className="text-white/80 text-sm font-mono mt-1">•••• {card.last4}</p>
            </div>
            {!card.isActive && (
              <span className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                Inactive
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-white/70 text-sm">Balance</span>
              <span className="text-white text-2xl font-bold drop-shadow-lg">
                ${card.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-white/70 text-sm">Limit</span>
              <span className="text-white text-lg font-medium">
                ${card.limit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative chip */}
        <div className="absolute top-6 right-6 w-12 h-10 bg-yellow-400/30 backdrop-blur-sm rounded-md border border-yellow-400/50" />
      </div>

      {/* Card Details */}
      <div className="p-6 space-y-4">
        {/* Utilization Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Utilization</span>
            <span className={`text-sm font-bold ${utilization > 80 ? 'text-red-500' : utilization > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
              {utilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${utilizationColor} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-3">
          <Calendar size={18} className={dueDateUrgency} />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Due {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            <p className={`text-xs font-medium ${dueDateUrgency}`}>
              {daysUntilDue <= 0 ? 'Overdue' : daysUntilDue === 1 ? 'Due tomorrow' : `${daysUntilDue} days left`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onRecordPayment(card)}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            disabled={!card.isActive}
          >
            <DollarSign size={16} />
            Record Payment
          </button>
          <button
            onClick={() => onEdit(card)}
            className="flex items-center justify-center gap-2 bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${card.name}"?`)) {
                deleteCreditCard(card.id);
              }
            }}
            className="flex items-center justify-center gap-2 bg-destructive/10 text-destructive px-3 py-2 rounded-lg hover:bg-destructive/20 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
