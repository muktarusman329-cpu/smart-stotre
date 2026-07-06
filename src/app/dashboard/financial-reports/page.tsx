'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Download, Calendar, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function FinancialReportsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const financialMetrics = [
    {
      id: 'revenue',
      name: 'Total Revenue',
      value: 1250000,
      change: 12.5,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: 'profit',
      name: 'Net Profit',
      value: 375000,
      change: 8.3,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      id: 'expenses',
      name: 'Total Expenses',
      value: 875000,
      change: -5.2,
      icon: Wallet,
      color: 'text-red-600'
    },
    {
      id: 'margin',
      name: 'Profit Margin',
      value: 30,
      change: 2.1,
      icon: TrendingUp,
      color: 'text-purple-600',
      isPercentage: true
    }
  ];

  const expenseBreakdown = [
    { category: 'Inventory Purchases', amount: 650000, percentage: 74.3 },
    { category: 'Staff Salaries', amount: 150000, percentage: 17.1 },
    { category: 'Utilities', amount: 35000, percentage: 4.0 },
    { category: 'Rent', amount: 25000, percentage: 2.9 },
    { category: 'Other', amount: 15000, percentage: 1.7 }
  ];

  const revenueByCategory = [
    { category: 'Beverages', amount: 350000, percentage: 28.0 },
    { category: 'Food', amount: 425000, percentage: 34.0 },
    { category: 'Dairy', amount: 200000, percentage: 16.0 },
    { category: 'Snacks', amount: 175000, percentage: 14.0 },
    { category: 'Household', amount: 100000, percentage: 8.0 }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Financial Reports" userRole="admin" />
      
      <main className="py-6">
        {/* Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {financialMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span className="font-bold">{Math.abs(metric.change)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.name}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {metric.isPercentage ? `${metric.value}%` : formatCurrency(metric.value)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Breakdown */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Expense Breakdown</h3>
              <div className="space-y-4">
                {expenseBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{item.category}</span>
                      <span className="text-sm font-bold text-foreground">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.percentage}% of total</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Category */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Revenue by Category</h3>
              <div className="space-y-4">
                {revenueByCategory.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{item.category}</span>
                      <span className="text-sm font-bold text-foreground">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.percentage}% of total</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Gross Revenue</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(1250000)}</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(875000)}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(375000)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
