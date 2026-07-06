'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Percent, Search, Plus, Edit, Trash2, Calendar, Tag, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function PromotionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for promotions
  const promotions = [
    {
      id: 'PROM-001',
      name: 'Weekend Special',
      description: '20% off all beverages',
      type: 'percentage',
      value: 20,
      startDate: new Date('2024-01-13'),
      endDate: new Date('2024-01-15'),
      status: 'active',
      applicableProducts: ['Beverages'],
      usageCount: 156
    },
    {
      id: 'PROM-002',
      name: 'Bulk Purchase Discount',
      description: 'Buy 5 get 1 free on selected items',
      type: 'buy_x_get_y',
      value: { buy: 5, get: 1 },
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-01-31'),
      status: 'active',
      applicableProducts: ['Food', 'Snacks'],
      usageCount: 89
    },
    {
      id: 'PROM-003',
      name: 'New Year Clearance',
      description: 'Flat ₦500 off on all items above ₦2000',
      type: 'fixed',
      value: 500,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
      status: 'expired',
      applicableProducts: ['All'],
      usageCount: 423
    },
    {
      id: 'PROM-004',
      name: 'Customer Loyalty Bonus',
      description: '10% off for registered customers',
      type: 'percentage',
      value: 10,
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-02-20'),
      status: 'scheduled',
      applicableProducts: ['All'],
      usageCount: 0
    }
  ];

  const filteredPromotions = promotions.filter(promo => 
    promo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    promo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string, value: any) => {
    switch (type) {
      case 'percentage': return `${value}% Off`;
      case 'fixed': return `${formatCurrency(value)} Off`;
      case 'buy_x_get_y': return `Buy ${value.buy} Get ${value.get}`;
      default: return type;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Discounts & Promotions" userRole="admin" />
      
      <main className="py-6">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search promotions..."
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
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPromotions.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Percent className="h-4 w-4 text-primary" />
                        <span className="font-bold text-foreground">{promo.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{promo.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(promo.status)}`}>
                      {promo.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium text-foreground">{getTypeLabel(promo.type, promo.value)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Period</span>
                      <span className="font-medium text-foreground">
                        {promo.startDate.toLocaleDateString()} - {promo.endDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Products</span>
                      <span className="font-medium text-foreground">{promo.applicableProducts.join(', ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="font-medium text-foreground">{promo.usageCount} times</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {promo.status === 'active' ? (
                      <Button variant="outline" size="sm" className="text-yellow-600 hover:text-yellow-700">
                        Pause
                      </Button>
                    ) : promo.status === 'paused' ? (
                      <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredPromotions.length === 0 && (
          <div className="text-center py-12">
            <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No promotions found matching your search</p>
          </div>
        )}
      </main>
    </div>
  );
}
