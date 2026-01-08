import { NextRequest, NextResponse } from 'next/server';

// NOTE: This API route is currently a placeholder for future Supabase integration.
// The current implementation uses Zustand store with localStorage for persistence.
// To integrate with Supabase:
// 1. Create credit_cards table in Supabase (see schema below)
// 2. Implement CRUD operations using supabase client
// 3. Update useBudgetStore to sync with API
// 4. Add proper authentication checks using auth.uid()

/*
Suggested Supabase schema for credit_cards:

CREATE TABLE IF NOT EXISTS public.credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  last4 TEXT NOT NULL CHECK (last4 ~ '^\d{4}$'),
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  credit_limit DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_cards_user ON public.credit_cards(user_id);

-- RLS Policies
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" ON public.credit_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.credit_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON public.credit_cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON public.credit_cards
  FOR DELETE USING (auth.uid() = user_id);
*/

// GET - Fetch all credit cards for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Placeholder: Return empty array until Supabase integration
    return NextResponse.json([]);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new credit card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.last4 || !body.dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, last4, dueDate' },
        { status: 400 }
      );
    }

    // Validate last4 digits
    if (!/^\d{4}$/.test(body.last4)) {
      return NextResponse.json(
        { error: 'last4 must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Placeholder: Return success until Supabase integration
    return NextResponse.json({ message: 'Placeholder - integrate with Supabase' }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update credit card
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing card id' },
        { status: 400 }
      );
    }

    // Placeholder: Return success until Supabase integration
    return NextResponse.json({ message: 'Placeholder - integrate with Supabase' }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete credit card
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing card id' },
        { status: 400 }
      );
    }

    // Placeholder: Return success until Supabase integration
    return NextResponse.json({ message: 'Placeholder - integrate with Supabase' }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
