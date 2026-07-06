'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Package, Search, Download, Calendar, TrendingUp, TrendingDown, AlertTriangle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function InventoryReportsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const inventoryMetrics = [
    {
      id: 'total-value',
      name: 'Total Inventory Value',
      value: 8500000,
      change: 5.2,
      icon: Package,
      color: 'text-green-600'
    },
    {
      id: 'low-stock',
      name: 'Low Stock Items',
      value: 23,
      change: -12.5,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      id: 'out-of-stock',
      name: 'Out of Stock',
      value: 8,
      change: -3.1,
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      id: 'turnover',
      name: 'Inventory Turnover',
      value: 4.2,
      change: 8.7,
      icon: TrendingUp,
      color: 'text-blue-600',
      isDecimal: true
    }
  ];

  const categoryPerformance = [
    { category: 'Beverages', totalValue: 2500000, lowStock: 5, outOfStock: 1, turnover: 5.1 },
    { category: 'Food', totalValue: 3200000, lowStock: 8, outOfStock: 3, turnover: 4.8 },
    { category: 'Dairy', totalValue: 1500000, lowStock: 6, outOfStock: 2, turnover: 3.9 },
    { category: 'Snacks', totalValue: 800000, lowStock: 3, outOfStock: 1, turnover: 4.2 },
    { category: 'Household', totalValue: 500000, lowStock: 1, outOfStock: 1, turnover: 2.8 }
  ];

  const stockMovements = [
    { id: 'MOV-001', product: 'Coca-Cola 50cl', type: 'in', quantity: 100, reason: 'Restock', date: new Date('2024-01-15') },
    { id: 'MOV-002', product: 'Indomie Chicken', type: 'out', quantity: 50, reason: 'Sales', date: new Date('2024-01-15') },
    { id: 'MOV-003', product: 'Bread Sliced', type: 'in', quantity: 30, reason: 'New Delivery', date: new Date('2024-01-14') },
    { id: 'MOV-004', product: 'Fresh Milk 1L', type: 'out', quantity: 20, reason: 'Damaged', date: new Date('2024-01-14') }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Inventory Reports" userRole="manager" />
      
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
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              <option value="beverages">Beverages</option>
              <option value="food">Food</option>
              <option value="dairy">Dairy</option>
            </select>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Inventory Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {inventoryMetrics.map((metric, index) => (
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
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-bold">{Math.abs(metric.change)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.name}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {metric.isDecimal ? metric.value.toFixed(1) : metric.value.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Category Performance */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Category Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase">Total Value</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase">Low Stock</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase">Out of Stock</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase">Turnover Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryPerformance.map((category, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 font-medium text-foreground">{category.category}</td>
                      <td className="py-3 px-4 text-foreground">{formatCurrency(category.totalValue)}</td>
                      <td className="py-3 px-4">
                        <span className={category.lowStock > 5 ? 'text-red-600 font-bold' : 'text-foreground'}>
                          {category.lowStock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={category.outOfStock > 0 ? 'text-red-600 font-bold' : 'text-foreground'}>
                          {category.outOfStock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground">{category.turnover.toFixed(1)}x</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Stock Movements */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Recent Stock Movements</h3>
            <div className="space-y-3">
              {stockMovements.map((movement, index) => (
                <motion.div
                  key={movement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      movement.type === 'in' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {movement.type === 'in' ? (
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{movement.product}</p>
                      <p className="text-xs text-muted-foreground">{movement.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">{movement.date.toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
