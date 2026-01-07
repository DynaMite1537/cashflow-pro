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
} from 'recharts';
import { DailySimulationResult } from '@/types';

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
  }));

  const minBalance = Math.min(...chartData.map(d => d.balance));
  const hasNegative = minBalance < 0;
  
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
        
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--popover-foreground))',
          }}
          labelStyle={{ fontWeight: 600 }}
          formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        
        <Legend />
        
        <Line
          type="monotone"
          dataKey="balance"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
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
