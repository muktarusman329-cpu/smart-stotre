'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ArrowUpDown, Search, Plus, Filter, Calendar, User, Package, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function StockAdjustmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for stock adjustments
  const adjustments = [
    {
      id: 'ADJ-001',
      productId: '1',
      productName: 'Coca-Cola 50cl',
      adjustmentType: 'increase',
      quantity: 50,
      reason: 'Restock',
      previousStock: 45,
      newStock: 95,
      performedBy: 'John Doe',
      date: new Date('2024-01-15T10:30:00'),
      status: 'approved'
    },
    {
      id: 'ADJ-002',
      productId: '2',
      productName: 'Indomie Chicken',
      adjustmentType: 'decrease',
      quantity: 5,
      reason: 'Damaged goods',
      previousStock: 13,
      newStock: 8,
      performedBy: 'Jane Smith',
      date: new Date('2024-01-15T09:15:00'),
      status: 'pending'
    },
    {
      id: 'ADJ-003',
      productId: '3',
      productName: 'Bread Sliced',
      adjustmentType: 'increase',
      quantity: 20,
      reason: 'New delivery',
      previousStock: 0,
      newStock: 20,
      performedBy: 'John Doe',
      date: new Date('2024-01-14T16:45:00'),
      status: 'approved'
    }
  ];

  const filteredAdjustments = adjustments.filter(adj => 
    adj.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    adj.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Stock Adjustments" userRole="admin" />
      
      <main className="py-6">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search adjustments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Adjustment
          </Button>
        </div>

        {/* Adjustments List */}
        <div className="space-y-4">
          {filteredAdjustments.map((adjustment, index) => (
            <motion.div
              key={adjustment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                        <span className="font-bold text-foreground">{adjustment.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          adjustment.status === 'approved' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : adjustment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {adjustment.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{adjustment.productName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Type</p>
                      <p className={`font-medium text-sm ${
                        adjustment.adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {adjustment.adjustmentType.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                      <p className="font-medium text-sm">{adjustment.adjustmentType === 'increase' ? '+' : '-'}{adjustment.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Stock Change</p>
                      <p className="font-medium text-sm">{adjustment.previousStock} → {adjustment.newStock}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Reason</p>
                      <p className="font-medium text-sm">{adjustment.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{adjustment.performedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{adjustment.date.toLocaleString()}</span>
                      </div>
                    </div>
                    {adjustment.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredAdjustments.length === 0 && (
          <div className="text-center py-12">
            <ArrowUpDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No stock adjustments found</p>
          </div>
        )}
      </main>
    </div>
  );
}
