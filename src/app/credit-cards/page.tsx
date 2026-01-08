'use client';

import { useState } from 'react';
import { Plus, CreditCard as CreditCardIcon, TrendingUp, AlertTriangle } from 'lucide-react';
import { CreditCard as CreditCardType } from '@/types';
import { useCreditCards } from '@/store/useBudgetStore';
import { AddCardModal } from '@/components/credit-cards/AddCardModal';
import { CreditCardCard } from '@/components/credit-cards/CreditCardCard';
import { PaymentForm } from '@/components/credit-cards/PaymentForm';
import { PaymentHistory } from '@/components/credit-cards/PaymentHistory';

export default function CreditCardsPage() {
  const creditCards = useCreditCards();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [paymentCardId, setPaymentCardId] = useState<string>('');

  // Calculate total utilization
  const totalLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);
  const totalBalance = creditCards.reduce((sum, card) => sum + card.balance, 0);
  const totalUtilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
  const activeCards = creditCards.filter((c) => c.isActive);

  const handleEdit = (card: CreditCardType) => {
    setEditingCard(card);
    setIsAddModalOpen(true);
  };

  const handleRecordPayment = (card: CreditCardType) => {
    setPaymentCardId(card.id);
    setIsPaymentFormOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingCard(null);
  };

  const handleClosePaymentForm = () => {
    setIsPaymentFormOpen(false);
    setPaymentCardId('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Credit Cards</h1>
        <p className="text-muted-foreground">
          Track your credit card balances, payments, and utilization
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-foreground">
                $
                {totalBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <CreditCardIcon className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Total Limit */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Limit</p>
              <p className="text-2xl font-bold text-foreground">
                $
                {totalLimit.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Utilization */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Overall Utilization</p>
              <p
                className={`text-2xl font-bold ${totalUtilization > 80 ? 'text-red-500' : totalUtilization > 50 ? 'text-yellow-500' : 'text-green-500'}`}
              >
                {totalUtilization.toFixed(1)}%
              </p>
            </div>
            {totalUtilization > 80 ? (
              <AlertTriangle className="w-8 h-8 text-red-500" />
            ) : (
              <TrendingUp className="w-8 h-8 text-green-600" />
            )}
          </div>
        </div>
      </div>

      {/* Credit Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            Your Cards ({activeCards.length} active)
          </h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus size={20} />
            Add Card
          </button>
        </div>

        {creditCards.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <CreditCardIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No credit cards yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first credit card to start tracking balances and payments
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus size={20} />
              Add Your First Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditCards.map((card) => (
              <CreditCardCard
                key={card.id}
                card={card}
                onEdit={handleEdit}
                onRecordPayment={handleRecordPayment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div>
        <PaymentHistory />
      </div>

      {/* Add/Edit Modal */}
      <AddCardModal isOpen={isAddModalOpen} card={editingCard} onClose={handleCloseAddModal} />

      {/* Payment Form Modal */}
      <PaymentForm
        isOpen={isPaymentFormOpen}
        onClose={handleClosePaymentForm}
        preselectedCardId={paymentCardId}
      />
    </div>
  );
}
