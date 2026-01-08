import { z } from 'zod';

// ============== Budget Rule Schema ==============
export const budgetRuleSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long (max 100 characters)'),
    amount: z
      .number()
      .min(0.01, 'Amount must be greater than 0')
      .max(100_000_000, 'Amount exceeds maximum (100M)'),
    type: z.enum(['income', 'expense'], {
      required_error: 'Type is required',
      invalid_type_error: 'Type must be either income or expense',
    }),
    category: z.enum(
      [
        'housing',
        'transport',
        'utilities',
        'food',
        'entertainment',
        'debt',
        'subscription',
        'other',
      ],
      {
        required_error: 'Category is required',
        invalid_type_error: 'Invalid category',
      }
    ),
    frequency: z.enum(['weekly', 'bi-weekly', 'monthly', 'yearly'], {
      required_error: 'Frequency is required',
      invalid_type_error: 'Invalid frequency',
    }),
    recurrence_day: z
      .number({
        required_error: 'Recurrence day is required',
        invalid_type_error: 'Must be a number',
      })
      .int('Recurrence day must be an integer')
      .min(0, 'Recurrence day must be at least 0')
      .max(31, 'Recurrence day must be at most 31')
      .nullable(),
    start_date: z
      .string({
        required_error: 'Start date is required',
        invalid_type_error: 'Start date must be a string',
      })
      .refine(
        (val) => {
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        { message: 'Invalid start date format' }
      ),
    end_date: z
      .string({
        invalid_type_error: 'End date must be a string',
      })
      .nullable()
      .refine(
        (val) => {
          if (!val) return true;
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        { message: 'Invalid end date format' }
      ),
    is_active: z.boolean({
      required_error: 'Active status is required',
      invalid_type_error: 'Must be a boolean',
    }),
  })
  .refine(
    (data) => {
      // End date must be after start date
      if (!data.end_date) return true;
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    {
      message: 'End date must be on or after start date',
      path: ['end_date'],
    }
  );

export type BudgetRuleInput = z.infer<typeof budgetRuleSchema>;

// ============== Transaction Schema ==============
export const transactionSchema = z.object({
  date: z
    .string({
      required_error: 'Date is required',
      invalid_type_error: 'Date must be a string',
    })
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Invalid date format' }
    ),
  description: z.string().max(200, 'Description too long (max 200 characters)').nullable(),
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Must be a number',
    })
    .min(0.01, 'Amount must be greater than 0')
    .max(100_000_000, 'Amount exceeds maximum (100M)'),
  type: z.enum(['income', 'expense'], {
    required_error: 'Type is required',
    invalid_type_error: 'Type must be either income or expense',
  }),
  is_reconciled: z.boolean({
    required_error: 'Reconciled status is required',
    invalid_type_error: 'Must be a boolean',
  }),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

// ============== Balance Checkpoint Schema ==============
export const checkpointSchema = z.object({
  date: z
    .string({
      required_error: 'Date is required',
      invalid_type_error: 'Date must be a string',
    })
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Invalid date format' }
    ),
  balance: z
    .number({
      required_error: 'Balance is required',
      invalid_type_error: 'Must be a number',
    })
    .min(-100_000_000, 'Balance is too low (min -100M)')
    .max(100_000_000, 'Balance is too high (max 100M)'),
  notes: z.string().max(500, 'Notes too long (max 500 characters)').nullable(),
});

export type CheckpointInput = z.infer<typeof checkpointSchema>;

// ============== Current Balance Update Schema ==============
export const balanceUpdateSchema = z.object({
  balance: z
    .number({
      required_error: 'Balance is required',
      invalid_type_error: 'Must be a number',
    })
    .min(-100_000_000, 'Balance is too low (min -100M)')
    .max(100_000_000, 'Balance is too high (max 100M)'),
});

export type BalanceUpdateInput = z.infer<typeof balanceUpdateSchema>;
