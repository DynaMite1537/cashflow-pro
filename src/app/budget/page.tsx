'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Search, SortAsc, SortDesc, CheckCircle, AlertTriangle } from 'lucide-react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { toastSuccess, toastError, toastInfo } from '@/lib/toast';
import { BudgetRuleCard } from '@/components/dashboard/BudgetRuleCard';
import { NoRules } from '@/components/ui/EmptyState';
import { BudgetRuleForm } from '@/components/dashboard/BudgetRuleForm';
import { BudgetRule, BudgetRuleInput } from '@/types';
import { useDebounce } from 'use-debounce';

type FilterType = 'all' | 'income' | 'expense' | 'active' | 'inactive';
type SortType = 'name-asc' | 'name-desc' | 'amount-asc' | 'amount-desc' | 'date-asc' | 'date-desc';

export default function BudgetPage() {
  const { rules, addRule, updateRule, deleteRule, setBalance } = useBudgetStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date-desc');
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<BudgetRule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search query to avoid unnecessary re-renders
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Filter rules
  const filteredRules = rules
    .filter((rule) => {
      if (filter === 'all') return true;
      if (filter === 'active') return rule.is_active;
      if (filter === 'inactive') return !rule.is_active;
      return rule.type === filter;
    })
    .filter((rule) => {
      if (!debouncedSearchQuery) return true;
      const query = debouncedSearchQuery.toLowerCase();
      return rule.name.toLowerCase().includes(query) ||
             rule.category.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'amount-asc':
          return a.amount - b.amount;
        case 'amount-desc':
          return b.amount - a.amount;
        case 'date-asc':
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        case 'date-desc':
        default:
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      }
    });

  // Helper function to convert amount to monthly equivalent
  const toMonthlyAmount = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return amount * 52 / 12; // 52 weeks per year / 12 months
      case 'bi-weekly':
        return amount * 26 / 12; // 26 bi-weekly periods per year / 12 months
      case 'monthly':
        return amount;
      case 'yearly':
        return amount / 12;
      default:
        return amount;
    }
  };

  // Stats (always calculate from active rules only, regardless of current filter)
  const activeIncome = rules
    .filter(r => r.type === 'income' && r.is_active)
    .reduce((sum, r) => sum + toMonthlyAmount(r.amount, r.frequency), 0);
  const activeExpenses = rules
    .filter(r => r.type === 'expense' && r.is_active)
    .reduce((sum, r) => sum + toMonthlyAmount(r.amount, r.frequency), 0);
  const monthlyNet = activeIncome - activeExpenses;

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this budget rule?')) {
      deleteRule(id);
      toastSuccess('Rule deleted', 'The budget rule has been removed');
    }
  };

  const handleToggleActive = (rule: BudgetRule) => {
    updateRule(rule.id, { is_active: !rule.is_active });
    const status = !rule.is_active ? 'activated' : 'deactivated';
    toastSuccess(`Rule ${status}`, `"${rule.name}" is now ${status}`);
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingRule(null);
  };

  // Close modal on Escape key
  useEffect(() => {
    if (showForm || editingRule !== null) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseModal();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [showForm, editingRule]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget Rules</h1>
          <p className="text-muted-foreground mt-1">
            Manage your recurring income and expenses
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Add Rule
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <p className="text-sm text-muted-foreground">Monthly Income</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            ${activeIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-muted-foreground">Monthly Expenses</p>
          </div>
          <p className="text-2xl font-bold text-destructive">
            ${activeExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            {monthlyNet >= 0 ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <p className="text-sm text-muted-foreground">Net Monthly</p>
          </div>
          <p className={`text-2xl font-bold ${monthlyNet >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            {monthlyNet >= 0 ? '+' : ''}
            ${Math.abs(monthlyNet).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-input/50 border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input"
          />
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter size={16} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="bg-input/50 border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input"
          >
            <option value="all">All Rules</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <button
            onClick={() => setSortBy(sortBy.includes('asc') ? 'name-desc' : 'name-asc')}
            className="hover:text-foreground transition-colors"
            title="Sort by name"
          >
            <span className="text-xs font-medium">Name</span>
            {sortBy.includes('name-asc') ? <SortDesc size={16} /> : <SortAsc size={16} />}
          </button>
          <button
            onClick={() => setSortBy(sortBy.includes('amount-asc') ? 'amount-desc' : 'amount-asc')}
            className="hover:text-foreground transition-colors"
            title="Sort by amount"
          >
            <span className="text-xs font-medium">Amount</span>
            {sortBy.includes('amount-asc') ? <SortDesc size={16} /> : <SortAsc size={16} />}
          </button>
        </div>
      </div>

      {/* Rules Grid */}
      {filteredRules.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRules.map((rule) => (
            <BudgetRuleCard
              key={rule.id}
              rule={rule}
              onEdit={() => setEditingRule(rule)}
              onDelete={() => handleDelete(rule.id)}
              onToggleActive={() => handleToggleActive(rule)}
            />
          ))}
        </div>
      ) : (
        <NoRules onCreate={() => setShowForm(true)} />
      )}

      {/* Form Modal */}
      {(showForm || editingRule !== null) && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close on backdrop click
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-card text-card-foreground rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">
                {editingRule ? 'Edit Budget Rule' : 'Create New Budget Rule'}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                {editingRule ? 'Update your recurring income or expense' : 'Set up a recurring income or expense'}
              </p>

              <BudgetRuleForm
                editingRule={editingRule}
                onSubmit={(data) => {
                  try {
                    if (editingRule) {
                      updateRule(editingRule.id, data);
                      toastSuccess('Rule updated', `"${data.name}" has been updated`);
                    } else {
                      addRule(data);
                      toastSuccess('Rule created', `"${data.name}" has been added`);
                    }
                    setShowForm(false);
                    setEditingRule(null);
                  } catch (error) {
                    toastError('Error', 'Failed to save budget rule');
                    console.error('Failed to save budget rule:', error);
                  }
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditingRule(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
