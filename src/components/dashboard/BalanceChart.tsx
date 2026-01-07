'use client';

import { memo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Scatter,
  ScatterChart,
  ZAxis,
  Cell,
} from 'recharts';
import { DailySimulationResult } from '@/types';
import { AlertCircle, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import dayjs from 'dayjs';

interface BalanceChartProps {
  data: DailySimulationResult[];
  height?: number;
  onDotClick?: (date: Date) => void;
}

export const BalanceChart = memo(function BalanceChart({ data, height = 400, onDotClick }: BalanceChartProps) {
  // Transform data for Recharts
  const chartData = data.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: day.date,
    dayOfWeek: dayjs(day.date).format('dddd'),
    balance: day.endingBalance,
    startingBalance: day.startingBalance,
    netChange: day.netChange,
    transactionCount: day.transactions.length,
    hasOverride: day.hasOverride || false,
    isCheckpoint: day.isCheckpoint,
    isLowestPoint: day.isLowestPoint,
  }));

  const minBalance = Math.min(...chartData.map(d => d.balance));
  const hasNegative = minBalance < 0;

  // Custom dot function to show different colors for override days
  const renderDot = (props: any) => {
    const { cx, cy, payload, key } = props;
    if (payload.hasOverride) {
      return (
        <AlertCircle
          key={key || payload.date}
          x={cx}
          y={cy}
          r={7}
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth={2.5}
          style={{ cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3))' }}
          onClick={() => onDotClick && onDotClick(new Date(key || payload.date))}
        />
      );
    }
    return (
      <circle
        key={key || payload.date}
        cx={cx}
        cy={cy}
        r={5}
        fill="hsl(var(--chart-line))"
        stroke="hsl(var(--background))"
        strokeWidth={2}
        style={{ cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(33, 133, 208, 0.3))' }}
        onClick={() => onDotClick && onDotClick(new Date(key || payload.date))}
      />
    );
  };

  // Custom active dot
  const renderActiveDot = (props: any) => {
    const { cx, cy, payload, key } = props;
    if (payload.hasOverride) {
      return (
        <AlertCircle
          key={key || payload.date}
          x={cx}
          y={cy}
          r={9}
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth={3}
          style={{ filter: 'drop-shadow(0 3px 6px rgba(245, 158, 11, 0.4))' }}
        />
      );
    }
    return (
      <circle
        key={key || payload.date}
        cx={cx}
        cy={cy}
        r={7}
        fill="hsl(var(--chart-line))"
        stroke="hsl(var(--background))"
        strokeWidth={3}
        style={{ filter: 'drop-shadow(0 3px 6px rgba(33, 133, 208, 0.4))' }}
      />
    );
  };

  // Custom tooltip to show override info
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isNegative = data.balance < 0;
      const isLow = data.balance < 100 && data.balance > 0;
      const netPositive = data.netChange > 0;

      return (
        <div
          className="bg-popover border border-border rounded-lg shadow-xl p-4 min-w-[200px]"
          style={{ color: 'hsl(var(--popover-foreground))' }}
        >
          {/* Date and Day */}
          <div className="mb-3">
            <p className="text-sm font-semibold text-foreground">{data.date}</p>
            <p className="text-xs text-muted-foreground">{data.dayOfWeek}</p>
          </div>

          {/* Balance Section */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Balance</span>
              <span className={`text-sm font-mono font-bold ${isNegative ? 'text-destructive' : 'text-foreground'}`}>
                ${data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Net Change */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Net Change</span>
              <div className="flex items-center gap-1">
                {netPositive ? (
                  <TrendingUp size={12} className="text-emerald-600" />
                ) : (
                  <TrendingDown size={12} className="text-destructive" />
                )}
                <span className={`text-xs font-mono ${netPositive ? 'text-emerald-600' : 'text-destructive'}`}>
                  {netPositive ? '+' : ''}${data.netChange.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Starting Balance */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Starting</span>
              <span className="text-xs font-mono text-muted-foreground">
                ${data.startingBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="border-t border-border pt-2 space-y-1">
            {/* Transaction Count */}
            <div className="flex items-center gap-2 text-xs">
              <Wallet size={12} className="text-muted-foreground" />
              <span className="text-muted-foreground">
                {data.transactionCount} transaction{data.transactionCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Override Warning */}
            {data.hasOverride && (
              <div className="flex items-center gap-1.5 text-amber-600 text-xs">
                <AlertCircle size={12} />
                <span className="font-medium">Manual adjustments</span>
              </div>
            )}

            {/* Risk Indicators */}
            {isNegative && (
              <div className="flex items-center gap-1.5 text-destructive text-xs font-medium">
                <TrendingDown size={12} />
                <span>⚠️ Negative balance</span>
              </div>
            )}
            {isLow && !isNegative && (
              <div className="flex items-center gap-1.5 text-amber-600 text-xs font-medium">
                <AlertCircle size={12} />
                <span>Low balance warning</span>
              </div>
            )}
            {data.isCheckpoint && (
              <div className="flex items-center gap-1.5 text-primary text-xs">
                <Wallet size={12} />
                <span>Balance checkpoint</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
          tick={{ fontSize: 10 }}
        />

        <YAxis
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
          tick={{ fontSize: 10 }}
          tickFormatter={(value: number) => `$${value.toLocaleString()}`}
        />

        <Tooltip content={renderTooltip} />

        <Legend />

        <Line
          type="monotone"
          dataKey="balance"
          stroke="hsl(var(--chart-line))"
          strokeWidth={3}
          dot={renderDot}
          activeDot={renderActiveDot}
          isAnimationActive={true}
          animationDuration={500}
        />

        <Line
          type="monotone"
          dataKey="startingBalance"
          stroke="hsl(var(--muted))"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Starting Balance"
          isAnimationActive={false}
        />

        {hasNegative && (
          <ReferenceLine
            y={0}
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            strokeDasharray="4 4"
            label="Zero"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
});
