'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { FileText, Search, Download, Calendar, TrendingUp, DollarSign, Package, Users, Filter, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useReports, useGenerateReport, useDownloadReport, useDeleteReport } from '@/hooks/useReports';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('sales');
  
  const { data: reports, isLoading, refetch } = useReports({ type: reportType });
  const generateReport = useGenerateReport();
  const downloadReport = useDownloadReport();
  const deleteReport = useDeleteReport();

  const reportTypes = [
    { id: 'sales', name: 'Sales Reports', icon: TrendingUp, description: 'Revenue, transactions, and performance' },
    { id: 'inventory', name: 'Inventory Reports', icon: Package, description: 'Stock levels, movements, and valuation' },
    { id: 'customers', name: 'Customer Reports', icon: Users, description: 'Customer behavior and analytics' },
    { id: 'financial', name: 'Financial Reports', icon: DollarSign, description: 'Profit, loss, and expenses' }
  ];

  const handleGenerateReport = (type: string) => {
    generateReport.mutate({ type, dateRange });
  };

  const handleDownload = (report: any) => {
    downloadReport.mutate(report);
  };

  const handleDelete = (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      deleteReport.mutate(reportId);
    }
  };

  const handleExportAll = () => {
    toast.info('Export all reports feature coming soon');
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Reports" userRole="admin" />
      
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
            <Button variant="outline" onClick={() => toast.info('Custom date range picker coming soon')}>
              <Calendar className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
          </div>
          <Button className="bg-primary text-primary-foreground" onClick={handleExportAll}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {reportTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  reportType === type.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setReportType(type.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <type.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{type.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <Button 
                className="w-full bg-primary text-primary-foreground"
                onClick={() => handleGenerateReport('sales')}
                disabled={generateReport.isPending}
              >
                {generateReport.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <FileText className="h-4 w-4 mr-2" />
                Generate Sales Report
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Button 
                className="w-full bg-primary text-primary-foreground"
                onClick={() => handleGenerateReport('inventory')}
                disabled={generateReport.isPending}
              >
                {generateReport.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Package className="h-4 w-4 mr-2" />
                Generate Inventory Report
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Button 
                className="w-full bg-primary text-primary-foreground"
                onClick={() => handleGenerateReport('customers')}
                disabled={generateReport.isPending}
              >
                {generateReport.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Users className="h-4 w-4 mr-2" />
                Generate Customer Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <ErrorBoundary>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Recent Reports</h3>
                {reports && reports.length > 0 ? (
                  <div className="space-y-3">
                    {reports.map((report, index) => (
                      <motion.div
                        key={report._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-medium text-foreground">{report.name}</span>
                            {report.status === 'pending' && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                Generating...
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Generated by {report.generatedBy}</span>
                            <span>•</span>
                            <span>{new Date(report.generatedAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(report)}
                            disabled={report.status !== 'completed' || downloadReport.isPending}
                          >
                            {downloadReport.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toast.info('Report viewer coming soon')}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(report._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No reports found. Generate your first report above.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}
