'use client';

import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface DashboardChartsProps {
  salesData: any[];
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
}

type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'yearly';

export function DashboardCharts({ salesData, timeFilter, onTimeFilterChange }: DashboardChartsProps) {
  const filters: { label: string; value: TimeFilter }[] = [
    { label: 'Day', value: 'daily' },
    { label: 'Week', value: 'weekly' },
    { label: 'Month', value: 'monthly' },
    { label: 'Year', value: 'yearly' }
  ];

  const getEntryClassName = (entry: any) => {
    if (entry.dataKey === 'revenue') return 'text-emerald-600';
    if (entry.dataKey === 'sales') return 'text-blue-600';
    if (entry.dataKey === 'profit') return 'text-violet-600';
    return 'text-foreground';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-xl">
          <p className="text-sm font-semibold text-muted-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className={`text-sm font-bold ${getEntryClassName(entry)}`}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {/* Revenue Chart */}
      <div className="bg-card rounded-2xl border border-border shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground">Revenue over time</p>
            </div>
          </div>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={timeFilter === filter.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onTimeFilterChange(filter.value)}
                className="text-xs"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sales Chart */}
      <div className="bg-card rounded-2xl border border-border shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Sales Overview</h3>
              <p className="text-sm text-muted-foreground">Sales vs Profit comparison</p>
            </div>
          </div>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={timeFilter === filter.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onTimeFilterChange(filter.value)}
                className="text-xs"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="sales" 
              fill="#3b82f6" 
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />
            <Bar 
              dataKey="profit" 
              fill="#8b5cf6" 
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
