'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ArrowLeftRight, Search, Receipt, Calendar, User, Package, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ReturnsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<any>(null);

  // Mock data for returns
  const returns = [
    {
      id: 'RET-001',
      saleId: 'SALE-1234',
      customerName: 'John Doe',
      items: [
        { name: 'Coca-Cola 50cl', quantity: 2, reason: 'Damaged' },
        { name: 'Bread Sliced', quantity: 1, reason: 'Expired' }
      ],
      totalRefund: 4500,
      refundMethod: 'Cash',
      date: new Date('2024-01-15'),
      status: 'approved',
      processedBy: 'Cashier 1'
    },
    {
      id: 'RET-002',
      saleId: 'SALE-1235',
      customerName: 'Jane Smith',
      items: [
        { name: 'Indomie Chicken', quantity: 5, reason: 'Wrong item' }
      ],
      totalRefund: 2500,
      refundMethod: 'Card',
      date: new Date('2024-01-14'),
      status: 'pending',
      processedBy: 'Cashier 2'
    }
  ];

  const filteredReturns = returns.filter(ret => 
    ret.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ret.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ret.saleId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Returns & Refunds" userRole="cashier" />
      
      <main className="py-6">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search returns by ID, customer, or sale number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button className="bg-primary text-primary-foreground">
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              New Return
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Returns List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredReturns.map((returnItem, index) => (
              <motion.div
                key={returnItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedReturn?.id === returnItem.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedReturn(returnItem)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Receipt className="h-4 w-4 text-primary" />
                          <span className="font-bold text-foreground">{returnItem.id}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Sale: {returnItem.saleId}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        returnItem.status === 'approved' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {returnItem.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{returnItem.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{returnItem.items.length} items</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-bold">₦{returnItem.totalRefund.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{returnItem.date.toLocaleDateString()}</span>
                      </div>
                      <span>By {returnItem.processedBy}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Return Details */}
          <div className="lg:col-span-1">
            {selectedReturn ? (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Return Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Return ID</p>
                      <p className="font-semibold text-foreground">{selectedReturn.id}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Original Sale</p>
                      <p className="font-semibold text-foreground">{selectedReturn.saleId}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Customer</p>
                      <p className="font-semibold text-foreground">{selectedReturn.customerName}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Items Being Returned</p>
                      <div className="space-y-2">
                        {selectedReturn.items.map((item: any, idx: number) => (
                          <div key={idx} className="bg-secondary/50 rounded-lg p-3">
                            <p className="font-medium text-foreground text-sm">{item.name}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                              <span className="text-xs text-muted-foreground">{item.reason}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Refund</span>
                        <span className="text-lg font-bold text-foreground">₦{selectedReturn.totalRefund.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Refund Method</span>
                        <span className="font-medium text-foreground">{selectedReturn.refundMethod}</span>
                      </div>
                    </div>

                    {selectedReturn.status === 'pending' && (
                      <div className="pt-4 space-y-2">
                        <Button className="w-full bg-primary text-primary-foreground">
                          Approve Return
                        </Button>
                        <Button variant="outline" className="w-full">
                          Reject Return
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a return to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
