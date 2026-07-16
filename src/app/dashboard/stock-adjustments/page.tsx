'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ArrowUpDown, Search, Plus, Filter, Calendar, User, Package, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useStockAdjustments, useApproveStockAdjustment, useRejectStockAdjustment } from '@/hooks/useStockAdjustments';
import { StockAdjustmentForm } from '@/components/dialogs/StockAdjustmentForm';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { toast } from 'sonner';

export default function StockAdjustmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: adjustments, isLoading, error, refetch } = useStockAdjustments({
    search: searchQuery,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const approveAdjustment = useApproveStockAdjustment();
  const rejectAdjustment = useRejectStockAdjustment();

  const handleCreateAdjustment = () => {
    setIsFormOpen(true);
  };

  const handleApprove = (id: string) => {
    if (confirm('Are you sure you want to approve this adjustment?')) {
      approveAdjustment.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to reject this adjustment?')) {
      rejectAdjustment.mutate(id);
    }
  };

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
          <Button 
            className="bg-primary text-primary-foreground"
            onClick={handleCreateAdjustment}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Adjustment
          </Button>
        </div>

        <ErrorBoundary>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <ArrowUpDown className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500">Failed to load adjustments</p>
              <Button onClick={() => refetch()} className="mt-4">Retry</Button>
            </div>
          ) : (
          <div className="space-y-4">
            {adjustments?.map((adjustment: any, index: number) => (
            <motion.div
              key={adjustment._id || adjustment.id || index}
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
                        <span className="font-bold text-foreground">{adjustment._id}</span>
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
                        <span>{adjustment.date ? new Date(adjustment.date).toLocaleString() : "N/A"}</span>
                      </div>
                    </div>
                    {adjustment.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApprove(adjustment._id)}
                          disabled={approveAdjustment.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleReject(adjustment._id)}
                          disabled={rejectAdjustment.isPending}
                        >
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
        )}

        {!isLoading && !error && (!adjustments || adjustments.length === 0) && (
          <div className="text-center py-12">
            <ArrowUpDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No stock adjustments found</p>
          </div>
        )}
        </ErrorBoundary>

        <StockAdjustmentForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={() => refetch()}
        />
      </main>
    </div>
  );
}
