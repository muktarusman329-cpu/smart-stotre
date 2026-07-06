'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Receipt, Search, Calendar, User, DollarSign, Printer, Download, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function ReceiptHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Mock data for receipts
  const receipts = [
    {
      id: 'RCP-001234',
      saleNumber: 'SALE-1234',
      customerName: 'John Doe',
      items: [
        { name: 'Coca-Cola 50cl', quantity: 2, price: 150 },
        { name: 'Indomie Chicken', quantity: 5, price: 100 },
        { name: 'Bread Sliced', quantity: 1, price: 800 }
      ],
      total: 2250,
      paymentMethod: 'Cash',
      date: new Date('2024-01-15T14:30:00'),
      cashier: 'John Doe'
    },
    {
      id: 'RCP-001235',
      saleNumber: 'SALE-1235',
      customerName: 'Jane Smith',
      items: [
        { name: 'Fresh Milk 1L', quantity: 2, price: 1200 },
        { name: 'Yogurt Pack', quantity: 1, price: 850 }
      ],
      total: 3250,
      paymentMethod: 'Card',
      date: new Date('2024-01-15T13:15:00'),
      cashier: 'John Doe'
    },
    {
      id: 'RCP-001236',
      saleNumber: 'SALE-1236',
      customerName: 'Walk-in Customer',
      items: [
        { name: 'Rice 5kg', quantity: 1, price: 4500 },
        { name: 'Vegetable Oil 1L', quantity: 2, price: 1800 }
      ],
      total: 8100,
      paymentMethod: 'Transfer',
      date: new Date('2024-01-15T11:45:00'),
      cashier: 'John Doe'
    }
  ];

  const filteredReceipts = receipts.filter(receipt => 
    receipt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receipt.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receipt.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Receipt History" userRole="cashier" />
      
      <main className="py-6">
        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search receipts by ID, sale number, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Receipts List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredReceipts.map((receipt, index) => (
              <motion.div
                key={receipt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedReceipt?.id === receipt.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedReceipt(receipt)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Receipt className="h-4 w-4 text-primary" />
                          <span className="font-bold text-foreground">{receipt.id}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Sale: {receipt.saleNumber}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                        COMPLETED
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{receipt.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{receipt.items.length} items</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-bold">{formatCurrency(receipt.total)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{receipt.date.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{receipt.paymentMethod}</span>
                        <span>•</span>
                        <span>{receipt.cashier}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Receipt Details */}
          <div className="lg:col-span-1">
            {selectedReceipt ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">Receipt Details</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Receipt ID</p>
                      <p className="font-semibold text-foreground">{selectedReceipt.id}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sale Number</p>
                      <p className="font-semibold text-foreground">{selectedReceipt.saleNumber}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Customer</p>
                      <p className="font-semibold text-foreground">{selectedReceipt.customerName}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Items Purchased</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedReceipt.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                            <div>
                              <p className="font-medium text-foreground text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₦{item.price}</p>
                            </div>
                            <span className="font-bold text-foreground text-sm">{formatCurrency(item.quantity * item.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Subtotal</span>
                        <span className="font-medium text-foreground">{formatCurrency(selectedReceipt.total)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tax</span>
                        <span className="font-medium text-foreground">₦0</span>
                      </div>
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">{formatCurrency(selectedReceipt.total)}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="font-medium text-foreground">{selectedReceipt.paymentMethod}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">Processed By</span>
                        <span className="font-medium text-foreground">{selectedReceipt.cashier}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">Date & Time</span>
                        <span className="font-medium text-foreground">{selectedReceipt.date.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a receipt to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
