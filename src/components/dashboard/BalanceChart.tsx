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
import { AlertCircle } from 'lucide-react';

interface BalanceChartProps {
  data: DailySimulationResult[];
  height?: number;
}

export const BalanceChart = memo(function BalanceChart({ data, height = 400 }: BalanceChartProps) {
  // Transform data for Recharts
  const chartData = data.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    balance: day.endingBalance,
    startingBalance: day.startingBalance,
    hasOverride: day.hasOverride || false,
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
          r={6}
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth={2}
          style={{ cursor: 'pointer' }}
        />
      );
    }
    return <circle key={key || payload.date} cx={cx} cy={cy} r={4} fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth={2} />;
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
          r={8}
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth={2}
        />
      );
    }
    return <circle key={key || payload.date} cx={cx} cy={cy} r={6} fill="hsl(var(--primary))" />;
  };

  // Custom tooltip to show override info
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            padding: '12px',
            color: 'hsl(var(--popover-foreground))',
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>{data.date}</p>
          <p style={{ fontSize: '14px' }}>
            Balance: ${data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {data.hasOverride && (
            <p style={{ fontSize: '12px', color: '#d97706', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={12} />
              This day has manual adjustments
            </p>
          )}
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
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={renderDot}
          activeDot={renderActiveDot}
          isAnimationActive={true}
          animationDuration={500}
        />

        <Line
          type="monotone"
          dataKey="startingBalance"
          stroke="hsl(var(--muted))"
          strokeWidth={1}
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
            label="Zero"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
});
