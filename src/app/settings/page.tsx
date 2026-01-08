'use client';

import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Download, Trash2, User, LogOut, RefreshCw, Upload } from 'lucide-react';
import { toastSuccess, toastError, toastInfo } from '@/lib/toast';
import { exportToCSV } from '@/lib/export';
import { loadSampleData } from '@/lib/sampleData';
import { parseExcelData, validateImportResult } from '@/lib/importData';
import { useBudgetStore } from '@/store/useBudgetStore';

export default function SettingsPage() {
  const { rules, transactions, currentBalance, addRule, addTransaction, resetAll } =
    useBudgetStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toastSuccess('Theme changed', `Switched to ${newTheme} mode`);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = {
        rules,
        transactions,
        currentBalance,
        exportDate: new Date().toISOString(),
      };

      await exportToCSV(data, 'cashflow-pro-export');
      toastSuccess('Export successful', 'Your data has been downloaded');
    } catch (error) {
      console.error('Export failed:', error);
      toastError('Export failed', 'Unable to export your data');
    } finally {
      setExporting(false);
    }
  };

  const handleLoadSampleData = () => {
    if (confirm('This will replace all your current data with sample data. Continue?')) {
      const result = loadSampleData();
      toastSuccess(
        'Sample data loaded',
        `Added ${result.rules} rules and ${result.transactions} transactions`
      );
    }
  };

  const handleClearAllData = async () => {
    if (confirm('Are you sure you want to delete ALL your data? This cannot be undone.')) {
      setClearing(true);
      try {
        // Clear local storage
        localStorage.removeItem('cashflow-storage');

        // Reset store
        resetAll();

        toastSuccess('Data cleared', 'All data has been removed');
      } catch (error) {
        console.error('Clear failed:', error);
        toastError('Clear failed', 'Unable to clear data');
      } finally {
        setClearing(false);
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExporting(true);
    try {
      const result = await parseExcelData(file);

      // Validate import
      const validation = validateImportResult(result);
      if (!validation.valid) {
        toastError('Import validation failed', validation.warnings.join(', '));
        return;
      }

      // Add imported data to store
      result.rules.forEach((rule) => {
        addRule({
          name: rule.name,
          amount: rule.amount,
          type: rule.type,
          category: rule.category as any,
          frequency: rule.frequency,
          recurrence_day: rule.recurrence_day,
          start_date: new Date(rule.start_date),
          end_date: rule.end_date ? new Date(rule.end_date) : null,
          is_active: true,
        });
      });

      result.transactions.forEach((transaction) => {
        addTransaction({
          date: new Date(transaction.date),
          description: transaction.description || null,
          amount: transaction.amount,
          type: transaction.type,
          is_reconciled: false,
        });
      });

      toastSuccess(
        'Import successful',
        `Added ${result.rules.length} rules and ${result.transactions.length} transactions`
      );
    } catch (error) {
      console.error('Import failed:', error);
      toastError('Import failed', 'Unable to parse file. Please check the format.');
    } finally {
      setExporting(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleSignOut = () => {
    // TODO: Integrate with actual auth system
    toastInfo('Sign out', 'Coming soon with Supabase Auth');
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your app experience and manage your data
        </p>
      </div>

      {/* Appearance Section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/30 border-b border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
          </div>
          <h2 className="text-lg font-semibold">Appearance</h2>
        </div>

        <div className="divide-y divide-border">
          <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-sm">
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Currently using {theme} theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/30"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              Toggle
            </button>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/30 border-b border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Download size={20} />
          </div>
          <h2 className="text-lg font-semibold">Data Management</h2>
        </div>

        <div className="divide-y divide-border">
          {/* Export */}
          <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-sm">Export to CSV</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download your budget rules and transactions
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/30 ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {exporting ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <Download size={16} />
                  Export
                </>
              )}
            </button>
          </div>

          {/* Import */}
          <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-sm">Import from CSV/Excel</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Import budget rules and transactions from a file
              </p>
            </div>
            <button
              onClick={handleImportClick}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/30"
            >
              <Upload size={16} />
              Import
            </button>
          </div>

          {/* Load Sample Data */}
          <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-sm">Load Sample Data</p>
              <p className="text-xs text-muted-foreground mt-0.5">Populate app with demo data</p>
            </div>
            <button
              onClick={handleLoadSampleData}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/30"
            >
              <RefreshCw size={16} />
              Load
            </button>
          </div>

          {/* Clear All Data */}
          <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-sm">Clear All Data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Delete all budget rules and transactions
              </p>
            </div>
            <button
              onClick={handleClearAllData}
              disabled={clearing}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 ${clearing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {clearing ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <Trash2 size={16} />
                  Clear
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/30 border-b border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <User size={20} />
          </div>
          <h2 className="text-lg font-semibold">Account</h2>
        </div>

        <div className="divide-y divide-border">
          <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-sm">Sign Out</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sign out of your account</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/30"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Data Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Budget Rules</p>
            <p className="text-2xl font-bold">{rules.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold font-mono">
              $
              {currentBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
