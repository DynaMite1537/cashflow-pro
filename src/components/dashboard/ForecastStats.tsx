'use client';

import { memo, useMemo } from 'react';
import { DailySimulationResult } from '@/types';
import dayjs from 'dayjs';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  AlertTriangle,
  Target,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ForecastStatsProps {
  simulation: DailySimulationResult[];
}

interface StatCard {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'muted';
}

export const ForecastStats = memo(function ForecastStats({ simulation }: ForecastStatsProps) {
  const days = simulation.length;

  // Calculate statistics
  const stats = useMemo(() => {
    if (simulation.length === 0) {
      return null;
    }

    const totalIncome = simulation.reduce((sum, day) => {
      return (
        sum +
        day.transactions.filter((t) => t.type === 'income').reduce((tSum, t) => tSum + t.amount, 0)
      );
    }, 0);

    const totalExpenses = simulation.reduce((sum, day) => {
      return (
        sum +
        day.transactions.filter((t) => t.type === 'expense').reduce((tSum, t) => tSum + t.amount, 0)
      );
    }, 0);

    const startBalance = simulation[0].startingBalance;
    const endBalance = simulation[simulation.length - 1].endingBalance;
    const netChange = endBalance - startBalance;

    const dailyIncome = totalIncome / days;
    const dailyExpenses = totalExpenses / days;
    const dailyNet = dailyIncome - dailyExpenses;

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const lowestPoint = simulation.reduce((min, day) =>
      day.endingBalance < min.endingBalance ? day : min
    );
    const highestPoint = simulation.reduce((max, day) =>
      day.endingBalance > max.endingBalance ? day : max
    );

    const negativeDays = simulation.filter((day) => day.endingBalance < 0).length;
    const hasNegative = negativeDays > 0;

    // Calculate average balance
    const averageBalance = simulation.reduce((sum, day) => sum + day.endingBalance, 0) / days;

    // Find longest streak of positive/negative
    let currentStreak = 0;
    let longestPositiveStreak = 0;
    let longestNegativeStreak = 0;

    for (const day of simulation) {
      if (day.endingBalance >= 0) {
        longestPositiveStreak = Math.max(longestPositiveStreak, ++currentStreak);
      } else {
        longestNegativeStreak = Math.max(longestNegativeStreak, ++currentStreak);
        currentStreak = 0;
      }
    }

    return {
      totalIncome,
      totalExpenses,
      startBalance,
      endBalance,
      netChange,
      dailyIncome,
      dailyExpenses,
      dailyNet,
      savingsRate,
      lowestPoint,
      highestPoint,
      averageBalance,
      negativeDays,
      hasNegative,
      longestPositiveStreak,
      longestNegativeStreak,
    };
  }, [simulation]);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-3" />
            <div className="h-6 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    return `${value < 0 ? '-' : ''}$${absValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Stat cards
  const cards: StatCard[] = [
    {
      title: 'Final Balance',
      value: formatCurrency(stats.endBalance),
      subtitle: `Starting: ${formatCurrency(stats.startBalance)}`,
      icon: <DollarSign size={20} />,
      trend: stats.netChange >= 0 ? 'up' : 'down',
      trendValue: formatPercentage((stats.netChange / Math.abs(stats.startBalance || 1)) * 100),
      color: stats.endBalance >= 0 ? 'success' : 'danger',
    },
    {
      title: 'Net Change',
      value: formatCurrency(stats.netChange),
      subtitle: `${days}-day projection`,
      icon: stats.netChange >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />,
      trend: stats.netChange >= 0 ? 'up' : 'down',
      trendValue: `${formatCurrency(stats.dailyNet)}/day`,
      color: stats.netChange >= 0 ? 'success' : 'danger',
    },
    {
      title: 'Savings Rate',
      value: formatPercentage(stats.savingsRate),
      subtitle: `${formatCurrency(stats.dailyIncome)} in, ${formatCurrency(stats.dailyExpenses)} out`,
      icon: <PiggyBank size={20} />,
      color: stats.savingsRate >= 20 ? 'success' : stats.savingsRate >= 0 ? 'warning' : 'danger',
    },
    {
      title: stats.hasNegative ? 'Risk Alert' : 'Balance Low Point',
      value: formatCurrency(stats.lowestPoint.endingBalance),
      subtitle: stats.hasNegative
        ? `${stats.negativeDays} negative day${stats.negativeDays > 1 ? 's' : ''}`
        : `Lowest: ${dayjs(stats.lowestPoint.date).format('MMM D')}`,
      icon: stats.hasNegative ? <AlertTriangle size={20} /> : <Target size={20} />,
      color: stats.hasNegative ? 'danger' : 'primary',
    },
  ];

  const getColorClasses = (color: StatCard['color']) => {
    const classes = {
      primary: {
        bg: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary/20',
      },
      success: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600',
        border: 'border-emerald-500/20',
      },
      warning: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-600',
        border: 'border-amber-500/20',
      },
      danger: {
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive/20',
      },
      muted: {
        bg: 'bg-muted',
        text: 'text-foreground',
        border: 'border-border',
      },
    };
    return classes[color];
  };

  const getTrendIcon = (trend: StatCard['trend']) => {
    switch (trend) {
      case 'up':
        return <ArrowUp size={12} className="text-emerald-600" />;
      case 'down':
        return <ArrowDown size={12} className="text-destructive" />;
      case 'neutral':
        return <Minus size={12} className="text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const colors = getColorClasses(card.color);
          return (
            <div
              key={idx}
              className={cn(
                'bg-card border rounded-lg p-4 hover:shadow-md transition-shadow',
                colors.border
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className={cn('p-2 rounded-lg', colors.bg)}>
                  <div className={colors.text}>{card.icon}</div>
                </div>
                {card.trend && (
                  <div className="flex items-center gap-1 text-xs">
                    {getTrendIcon(card.trend)}
                    {card.trendValue && (
                      <span
                        className={card.trend === 'up' ? 'text-emerald-600' : 'text-destructive'}
                      >
                        {card.trendValue}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Value */}
              <p className={cn('text-xl font-bold mb-1', colors.text)}>{card.value}</p>

              {/* Subtitle */}
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Income & Expenses */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold">Cash Flow</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Income</span>
              <span className="font-mono text-emerald-600">
                {formatCurrency(stats.totalIncome)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="font-mono text-destructive">
                {formatCurrency(stats.totalExpenses)}
              </span>
            </div>
            <div className="border-t border-border/50 pt-2 mt-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">Net Flow</span>
                <span
                  className={cn(
                    'font-mono',
                    stats.totalIncome >= stats.totalExpenses
                      ? 'text-emerald-600'
                      : 'text-destructive'
                  )}
                >
                  {formatCurrency(stats.totalIncome - stats.totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Range */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold">Balance Range</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Highest</span>
              <span className="font-mono text-emerald-600">
                {formatCurrency(stats.highestPoint.endingBalance)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lowest</span>
              <span
                className={cn(
                  'font-mono',
                  stats.lowestPoint.endingBalance < 0 ? 'text-destructive' : 'text-foreground'
                )}
              >
                {formatCurrency(stats.lowestPoint.endingBalance)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Average</span>
              <span className="font-mono text-foreground">
                {formatCurrency(stats.averageBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Streaks */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold">Streaks</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Longest Positive</span>
              <span className="font-mono text-emerald-600">
                {stats.longestPositiveStreak} day{stats.longestPositiveStreak !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Longest Negative</span>
              <span className="font-mono text-destructive">
                {stats.longestNegativeStreak} day{stats.longestNegativeStreak !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Negative days: {stats.negativeDays} / {days}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
