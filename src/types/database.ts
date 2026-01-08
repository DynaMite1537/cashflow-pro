export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      budget_rules: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          type: 'income' | 'expense';
          category:
            | 'housing'
            | 'transport'
            | 'utilities'
            | 'food'
            | 'entertainment'
            | 'debt'
            | 'subscription'
            | 'other';
          frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
          recurrence_day: number | null;
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          type: 'income' | 'expense';
          category:
            | 'housing'
            | 'transport'
            | 'utilities'
            | 'food'
            | 'entertainment'
            | 'debt'
            | 'subscription'
            | 'other';
          frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
          recurrence_day?: number | null;
          start_date: string;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          type?: 'income' | 'expense';
          category?:
            | 'housing'
            | 'transport'
            | 'utilities'
            | 'food'
            | 'entertainment'
            | 'debt'
            | 'subscription'
            | 'other';
          frequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
          recurrence_day?: number | null;
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          description: string | null;
          amount: number;
          type: 'income' | 'expense';
          is_reconciled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          description?: string | null;
          amount: number;
          type: 'income' | 'expense';
          is_reconciled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          description?: string | null;
          amount?: number;
          type?: 'income' | 'expense';
          is_reconciled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      balance_checkpoints: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          balance: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          balance: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          balance?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
