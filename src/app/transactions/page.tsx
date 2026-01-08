'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, ArrowDownCircle, ArrowUpCircle, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { toastSuccess, toastError } from '@/lib/toast';
import { formatCurrency } from '@/lib/dateUtils';
import { NoTransactions } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { TransactionRow, TransactionRowDataProps } from '@/components/transactions/TransactionRow';
import { List } from 'react-window';
import { useDebounce } from 'use-debounce';

type SortField = 'date' | 'amount' | 'description';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 25;

export default function TransactionsPage() {
  const { transactions, deleteTransaction, updateTransaction } = useBudgetStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query to avoid unnecessary re-renders
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      const query = debouncedSearchQuery.toLowerCase();
      return t.description?.toLowerCase().includes(query) || false;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = (a.description || '').localeCompare(b.description || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = (id: string, description: string | null) => {
    if (confirm(`Delete "${description || 'this transaction'}"?`)) {
      deleteTransaction(id);
      toastSuccess('Transaction deleted');
    }
  };

  const handleToggleReconciled = (id: string, currentStatus: boolean) => {
    updateTransaction(id, { is_reconciled: !currentStatus });
    toastSuccess('Transaction status updated');
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Calculate stats
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Manage one-time income and expenses
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Income</p>
          <p className="text-2xl font-bold text-emerald-600">
            +{formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Expenses</p>
          <p className="text-2xl font-bold text-destructive">
            -{formatCurrency(totalExpenses)}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-input/50 border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-input/50 border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>

        <div className="flex items-center gap-1 border-l border-border pl-3">
          <button
            onClick={() => handleSort('date')}
            className={cn(
              'px-3 py-2 text-sm transition-colors hover:bg-accent',
              sortField === 'date' && 'text-foreground font-medium'
            )}
          >
            Date
            {sortField === 'date' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          <button
            onClick={() => handleSort('amount')}
            className={cn(
              'px-3 py-2 text-sm transition-colors hover:bg-accent',
              sortField === 'amount' && 'text-foreground font-medium'
            )}
          >
            Amount
            {sortField === 'amount' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          <button
            onClick={() => handleSort('description')}
            className={cn(
              'px-3 py-2 text-sm transition-colors hover:bg-accent',
              sortField === 'description' && 'text-foreground font-medium'
            )}
          >
            Description
            {sortField === 'description' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Transactions Count & Pagination Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions</p>
        {totalPages > 1 && (
          <p>Page {currentPage} of {totalPages}</p>
        )}
      </div>

      {/* Transactions List */}
      {paginatedTransactions.length > 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <List<TransactionRowDataProps>
            rowComponent={TransactionRow}
            rowCount={paginatedTransactions.length}
            rowHeight={70}
            rowProps={{
              transactions: paginatedTransactions,
              onDelete: handleDelete,
              onToggleReconciled: handleToggleReconciled,
            }}
            style={{ height: 600 }}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-muted/30">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'w-10 h-10 rounded-md border border-border transition-colors',
                      currentPage === page
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-accent'
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <NoTransactions onAdd={() => {}} />
      )}
    </div>
  );
}
