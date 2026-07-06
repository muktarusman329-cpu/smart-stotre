'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ShoppingCart, Search, Plus, Filter, Calendar, Truck, CheckCircle, Clock, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for purchase orders
  const purchaseOrders = [
    {
      id: 'PO-001',
      supplierName: 'Coca-Cola Bottling Company',
      orderDate: new Date('2024-01-15'),
      expectedDelivery: new Date('2024-01-20'),
      totalAmount: 150000,
      status: 'pending',
      itemCount: 45,
      items: [
        { name: 'Coca-Cola 50cl', quantity: 100, price: 150 },
        { name: 'Fanta 50cl', quantity: 50, price: 150 }
      ]
    },
    {
      id: 'PO-002',
      supplierName: 'Indomie Foods Ltd',
      orderDate: new Date('2024-01-14'),
      expectedDelivery: new Date('2024-01-18'),
      totalAmount: 75000,
      status: 'approved',
      itemCount: 200,
      items: [
        { name: 'Indomie Chicken', quantity: 200, price: 100 },
        { name: 'Indomie Onion', quantity: 100, price: 100 }
      ]
    },
    {
      id: 'PO-003',
      supplierName: 'Local Bakery',
      orderDate: new Date('2024-01-13'),
      expectedDelivery: new Date('2024-01-15'),
      totalAmount: 24000,
      status: 'delivered',
      itemCount: 30,
      items: [
        { name: 'Bread Sliced', quantity: 30, price: 800 }
      ]
    }
  ];

  const filteredOrders = purchaseOrders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'delivered': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Purchase Orders" userRole="admin" />
      
      <main className="py-6">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search purchase orders..."
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
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Purchase Order
          </Button>
        </div>

        {/* Purchase Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        <span className="font-bold text-foreground">{order.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.supplierName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Order Date</p>
                      <p className="font-medium text-sm">{order.orderDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Expected Delivery</p>
                      <p className="font-medium text-sm">{order.expectedDelivery.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Items</p>
                      <p className="font-medium text-sm">{order.itemCount} products</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                      <p className="font-bold text-sm">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.status === 'pending' && (
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                    </div>
                    {order.status === 'approved' && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>In transit</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No purchase orders found</p>
          </div>
        )}
      </main>
    </div>
  );
}
