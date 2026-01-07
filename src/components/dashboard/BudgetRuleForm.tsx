'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { BudgetRule, BudgetRuleInput } from '@/types';
import { budgetRuleSchema, BudgetRuleInput as BudgetRuleValidationInput } from '@/lib/validation';

interface BudgetRuleFormProps {
  editingRule: BudgetRule | null;
  onSubmit: (data: BudgetRuleInput) => void;
  onCancel: () => void;
}

export function BudgetRuleForm({ editingRule, onSubmit, onCancel }: BudgetRuleFormProps) {
  const isEditing = !!editingRule;

  // Form state
  const [formData, setFormData] = useState<BudgetRuleValidationInput>({
    name: '',
    amount: 0,
    type: 'expense',
    category: 'other',
    frequency: 'monthly',
    recurrence_day: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to convert date to ISO string
  const dateToISOString = (date: Date | string): string => {
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (editingRule) {
      setFormData({
        name: editingRule.name,
        amount: editingRule.amount,
        type: editingRule.type,
        category: editingRule.category,
        frequency: editingRule.frequency,
        recurrence_day: editingRule.recurrence_day,
        start_date: dateToISOString(editingRule.start_date),
        end_date: editingRule.end_date ? dateToISOString(editingRule.end_date) : null,
        is_active: editingRule.is_active,
      });
    } else {
      // Reset to defaults for create mode
      setFormData({
        name: '',
        amount: 0,
        type: 'expense',
        category: 'other',
        frequency: 'monthly',
        recurrence_day: 1,
        start_date: new Date().toISOString().split('T')[0],
        end_date: null,
        is_active: true,
      });
    }
    setErrors({});
  }, [editingRule]);

  const handleChange = (field: keyof BudgetRuleValidationInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    try {
      budgetRuleSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    // Convert to BudgetRuleInput (Date objects instead of strings)
    const inputData: BudgetRuleInput = {
      name: formData.name,
      amount: formData.amount,
      type: formData.type,
      category: formData.category,
      frequency: formData.frequency,
      recurrence_day: formData.recurrence_day,
      start_date: new Date(formData.start_date),
      end_date: formData.end_date ? new Date(formData.end_date) : null,
      is_active: formData.is_active,
    };

    onSubmit(inputData);
  };

  const getRecurrenceDayLabel = () => {
    switch (formData.frequency) {
      case 'weekly':
        return 'Day of Week';
      case 'bi-weekly':
        return 'Start Day';
      case 'monthly':
        return 'Day of Month (1-31)';
      case 'yearly':
        return 'Day (1-31)';
      default:
        return 'Day';
    }
  };

  const getRecurrenceDayMin = () => {
    return formData.frequency === 'monthly' || formData.frequency === 'yearly' ? 1 : 0;
  };

  const isWeeklyBased = formData.frequency === 'weekly' || formData.frequency === 'bi-weekly';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleChange('type', 'income')}
            className={`flex-1 py-2 px-4 rounded-md border transition-colors ${
              formData.type === 'income'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-border hover:bg-muted'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => handleChange('type', 'expense')}
            className={`flex-1 py-2 px-4 rounded-md border transition-colors ${
              formData.type === 'expense'
                ? 'bg-destructive text-white border-destructive'
                : 'border-border hover:bg-muted'
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Rent, Salary, Netflix"
          className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input ${
            errors.name ? 'border-destructive' : 'border-border'
          }`}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Amount ($)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount || ''}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input ${
            errors.amount ? 'border-destructive' : 'border-border'
          }`}
        />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <select
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value as any)}
          className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input ${
            errors.category ? 'border-destructive' : 'border-border'
          }`}
        >
          <option value="housing">Housing</option>
          <option value="transport">Transport</option>
          <option value="utilities">Utilities</option>
          <option value="food">Food</option>
          <option value="entertainment">Entertainment</option>
          <option value="debt">Debt</option>
          <option value="subscription">Subscription</option>
          <option value="other">Other</option>
        </select>
        {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Frequency</label>
        <select
          value={formData.frequency}
          onChange={(e) => handleChange('frequency', e.target.value as any)}
          className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input ${
            errors.frequency ? 'border-destructive' : 'border-border'
          }`}
        >
          <option value="weekly">Weekly</option>
          <option value="bi-weekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        {errors.frequency && <p className="text-sm text-destructive">{errors.frequency}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{getRecurrenceDayLabel()}</label>
        {isWeeklyBased ? (
          // Dropdown for weekly/bi-weekly
          <select
            value={formData.recurrence_day ?? 0}
            onChange={(e) => handleChange('recurrence_day', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input ${
              errors.recurrence_day ? 'border-destructive' : 'border-border'
            }`}
          >
            <option value={0}>Sunday</option>
            <option value={1}>Monday</option>
            <option value={2}>Tuesday</option>
            <option value={3}>Wednesday</option>
            <option value={4}>Thursday</option>
            <option value={5}>Friday</option>
            <option value={6}>Saturday</option>
          </select>
        ) : (
          // Number input for monthly/yearly
          <input
            type="number"
            min={getRecurrenceDayMin()}
            max={31}
            value={formData.recurrence_day ?? ''}
            onChange={(e) => handleChange('recurrence_day', parseInt(e.target.value) || null)}
            className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input ${
              errors.recurrence_day ? 'border-destructive' : 'border-border'
            }`}
          />
        )}
        {errors.recurrence_day && <p className="text-sm text-destructive">{errors.recurrence_day}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Start Date</label>
        <input
          type="date"
          value={formData.start_date}
          onChange={(e) => handleChange('start_date', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input ${
            errors.start_date ? 'border-destructive' : 'border-border'
          }`}
        />
        {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">End Date (Optional)</label>
        <input
          type="date"
          value={formData.end_date || ''}
          onChange={(e) => handleChange('end_date', e.target.value || null)}
          className={`w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input ${
            errors.end_date ? 'border-destructive' : 'border-border'
          }`}
        />
        {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => handleChange('is_active', e.target.checked)}
          className="w-4 h-4 rounded border-border"
        />
        <label htmlFor="is_active" className="text-sm font-medium">Active</label>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {isEditing ? 'Update Rule' : 'Create Rule'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 border border-border rounded-md hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
