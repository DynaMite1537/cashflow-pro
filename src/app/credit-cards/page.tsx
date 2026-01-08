'use client';

import { useState } from 'react';
import { useCreditCards, useBudgetStore } from '@/store/useBudgetStore';
import { CreditCard } from '@/types';
import { CreditCard as CreditCardIcon, Plus } from 'lucide-react';
import { AddCardModal } from '@/components/credit-cards/AddCardModal';

export default function CreditCardsPage() {
  const { addCreditCard, deleteCreditCard } = useBudgetStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  const totalLimit = useCreditCards().reduce((sum, card) => sum + card.limit, 0);
  const totalBalance = useCreditCards().reduce((sum, card) => sum + card.balance, 0);
  const totalUtilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

  const handleAddCard = () => {
    setIsModalOpen(true);
    setSelectedCard(null);
  };

  const handleEditCard = (card: CreditCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('Are you sure you want to delete this credit card?')) {
      deleteCreditCard(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Credit Cards</h1>
          <p className="text-muted-foreground mt-1">
            Track your credit cards, due dates, and payments
          </p>
        </div>
        <button
          onClick={handleAddCard}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          Add Credit Card
        </button>
      </div>

      {/* Utilization Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Credit Limit</p>
          <p className="text-2xl font-bold text-foreground">
            ${totalLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Balance</p>
          <p className="text-2xl font-bold text-destructive">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Utilization</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${totalUtilization > 80 ? 'text-destructive' : totalUtilization > 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {totalUtilization.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Credit Cards List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Your Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCreditCards().map((card) => (
            <div
              key={card.id}
              onClick={() => handleEditCard(card)}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: card.color || 'hsl(var(--primary))' }}
                  >
                    <CreditCardIcon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{card.name}</h3>
                    <p className="text-sm text-muted-foreground">•••• {card.last4}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(card.id);
                  }}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Plus size={16} className="text-destructive" />
                </button>
              </div>

              {/* Utilization Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-mono font-semibold text-foreground">
                    ${card.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Limit</span>
                  <span className="font-mono font-semibold text-foreground">
                    ${card.limit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((card.balance / card.limit) * 100, 100)}%`,
                        backgroundColor: card.balance > card.limit ? 'hsl(var(--destructive))' : card.balance / card.limit > 0.8 ? 'hsl(var(--warning))' : 'hsl(var(--success))',
                      }}
                    />
                  </div>
                </div>

              {/* Due Date */}
              <div className="flex items-center gap-2 text-sm pt-4 border-t border-border">
                <span className="text-muted-foreground">Next Due</span>
                <span className="font-mono text-foreground">
                  {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {useCreditCards().length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <CreditCardIcon size={48} className="text-muted-foreground mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Credit Cards Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start tracking your credit cards to monitor due dates and utilization.
          </p>
          <button
            onClick={handleAddCard}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            Add Your First Credit Card
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddCardModal
        isOpen={isModalOpen}
        card={selectedCard}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCard(null);
        }}
      />
    </div>
  );
}
