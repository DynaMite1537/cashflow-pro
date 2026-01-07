# CashFlow Pro

Financial simulation and forecasting tool that predicts your future bank balance based on recurring rules and one-time transactions.

## Features

- **90-Day Projection**: Visual forecast of your financial future
- **Editable Reality Anchor**: Update your current balance anytime
- **Quick Transactions**: Add one-time income or expenses on the fly
- **Auto-Save**: All changes automatically saved with 1-second debounce
- **Undo/Redo**: Ctrl+Z to undo any action (up to 50 actions)
- **Risk Detection**: See when you might go negative
- **Recurring Rules**: Manage weekly, bi-weekly, monthly, yearly expenses/income
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand + Zundo (time-travel)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Dates**: date-fns
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budeting-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```bash
   # For local development (requires Supabase running)
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
   
   # For production
   # NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Supabase Setup

### Local Development

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase**
   ```bash
   supabase init
   ```

3. **Start local Supabase stack**
   ```bash
   supabase start
   ```

   This starts:
   - PostgreSQL database (port 54322)
   - API (port 54321)
   - Studio UI (port 54323) - open at http://localhost:54323

4. **Apply migrations**
   ```bash
   supabase db reset
   ```

### Production

1. Create a project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Update `.env.local` with production values
4. Apply migrations:
   ```bash
   supabase db push
   ```

## Database Schema

### Tables

#### `user_profiles`
User profile data linked to auth users.

#### `budget_rules`
Recurring income and expenses:
- `type`: income | expense
- `category`: housing | transport | utilities | food | entertainment | debt | subscription | other
- `frequency`: weekly | bi-weekly | monthly | yearly
- `recurrence_day`: Day of week/month for recurrence

#### `transactions`
One-time transactions:
- `is_reconciled`: Whether transaction is confirmed

#### `balance_checkpoints`
Manual balance adjustments:
- `date`: UNIQUE constraint (one checkpoint per date)

### Row Level Security

All tables have RLS policies ensuring users can only access their own data.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/              # API routes (Supabase backend)
│   ├── forecast/          # Main dashboard page
│   ├── budget/            # Budget rules management
│   ├── calendar/          # Calendar view
│   └── layout.tsx         # Root layout with DashboardShell
├── components/
│   ├── dashboard/         # Dashboard-specific components
│   ├── layout/            # Layout components (sidebar, nav)
│   └── ui/               # Reusable UI components
├── hooks/
│   ├── useAutoSave.ts    # Auto-save with debouncing
│   ├── useSimulation.ts   # Simulation engine hook
│   ├── useKeyboardShortcuts.ts
│   └── useValidation.ts   # Form validation hook
├── lib/
│   ├── dateUtils.ts       # Date manipulation utilities
│   ├── simulation.ts      # Core simulation algorithm
│   ├── validation.ts      # Zod schemas
│   └── supabase/         # Supabase client
├── store/
│   └── useBudgetStore.ts # Zustand store with undo/redo
└── types/
    ├── index.ts           # App types
    └── database.ts        # Supabase generated types
```

## Key Algorithms

### Simulation Engine

The simulation runs day-by-day for 90 days:

1. Check for balance checkpoint on that date → Use checkpoint balance
2. Find matching recurring rules (weekly, bi-weekly, monthly, yearly)
3. Find matching one-time transactions
4. Calculate net change (income - expenses)
5. Update running balance
6. Track minimum balance and overdraft dates

### Date Matching

- **Weekly**: Matches day of week (0=Sunday, 6=Saturday)
- **Bi-weekly**: Every 14 days from start date
- **Monthly**: Matches day of month (handles end-of-month)
- **Yearly**: Matches same month and day as start date

## Keyboard Shortcuts

- **Ctrl+Z**: Undo last action
- **Ctrl+Shift+Z**: Redo undone action
- **Enter** (in balance edit): Save balance

## State Persistence

- **Local Storage**: All state persisted via Zustand persist middleware
- **Auto-Save**: Changes saved to Supabase after 1-second debounce
- **History**: Up to 50 actions stored for undo/redo

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Other Platforms

Any platform supporting Next.js works:
- Netlify
- Cloudflare Pages
- AWS Amplify
- Railway

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|-----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | Yes | `eyJh...` |

## Troubleshooting

### Server won't start
- Delete `.next` folder and run `npm run dev` again
- Check port 3000 isn't in use

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version: `node --version` (should be 18+)

### CSS errors
- Delete `.next` folder
- Restart dev server

### Database connection issues
- Verify Supabase is running: `supabase status`
- Check `.env.local` has correct values
- Verify RLS policies in Supabase dashboard

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit pull request

## License

MIT

## Credits

Built with:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [Lucide Icons](https://lucide.dev)
