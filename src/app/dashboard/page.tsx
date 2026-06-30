'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { KPICard } from '@/components/kpi-card';
import { DashboardCharts } from '@/components/dashboard-charts';
import { getDashboardStats, getSalesData } from '@/lib/actions/dashboard';
import { formatCurrency } from '@/lib/utils';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Users,
  Wallet,
  Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4
    }
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await getDashboardStats();
        setStats(statsData);
        
        const sales = await getSalesData('monthly');
        setSalesData(sales);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <DashboardHeader title="Executive Overview" userRole="admin" />
      
      <main className="p-8">
        {/* KPI Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10"
        >
          <motion.div variants={itemVariants}>
            <KPICard
              title="Today's Revenue"
              value={formatCurrency(stats?.todayRevenue || 0)}
              change={`${stats?.todaySalesCount || 0} sales today`}
              icon={DollarSign}
              iconColor="text-emerald-600"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPICard
              title="Monthly Revenue"
              value={formatCurrency(stats?.monthlyRevenue || 0)}
              change={`${stats?.revenueChange >= 0 ? '+' : ''}${(stats?.revenueChange || 0).toFixed(1)}% vs last month`}
              changeType={stats?.revenueChange >= 0 ? 'positive' : 'negative'}
              icon={TrendingUp}
              iconColor="text-blue-600"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPICard
              title="Active Inventory"
              value={stats?.totalProducts || 0}
              change={`${stats?.lowStockProducts || 0} items low`}
              changeType="negative"
              icon={Package}
              iconColor="text-purple-600"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPICard
              title="Net Profit"
              value={formatCurrency(stats?.totalProfit || 0)}
              change={`Expenses: ${formatCurrency(stats?.totalExpenses || 0)}`}
              icon={Wallet}
              iconColor="text-indigo-600"
            />
          </motion.div>
        </motion.div>

        {/* Alert Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          <motion.div variants={itemVariants}>
            <KPICard
              title="Restock Required"
              value={stats?.lowStockProducts || 0}
              change="Critical stock levels"
              changeType="negative"
              icon={AlertTriangle}
              iconColor="text-orange-600"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPICard
              title="Expiry Risk"
              value={stats?.expiringProducts || 0}
              change="Expiring < 15 days"
              changeType="negative"
              icon={AlertTriangle}
              iconColor="text-rose-600"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPICard
              title="Loyal Customers"
              value={stats?.totalCustomers || 0}
              change="Registered base"
              icon={Users}
              iconColor="text-teal-600"
            />
          </motion.div>
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <DashboardCharts salesData={salesData || []} />
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card rounded-[2.5rem] shadow-lg border border-border overflow-hidden"
        >
          <div className="flex items-center justify-between p-8 border-b border-border">
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight uppercase">Recent Transactions</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1">Real-time update from all terminals</p>
            </div>
            <button className="px-6 py-3 bg-secondary text-muted-foreground font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all text-sm uppercase tracking-widest hover:scale-105 active:scale-95">
              Export Log
            </button>
          </div>
          <div className="overflow-x-auto text-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="text-left py-6 px-8 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Transaction ID</th>
                  <th className="text-left py-6 px-8 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Customer / Entity</th>
                  <th className="text-left py-6 px-8 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Authorized By</th>
                  <th className="text-left py-6 px-8 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Net Amount</th>
                  <th className="text-left py-6 px-8 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Method</th>
                  <th className="text-left py-6 px-8 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(stats?.recentTransactions || []).map((transaction: any, index: number) => (
                  <motion.tr
                    key={transaction._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + (index * 0.05) }}
                    className="group hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="py-6 px-8">
                      <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{transaction.saleNumber}</span>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase group-hover:scale-110 transition-transform">
                          {(transaction.customerName || 'WI').substring(0, 2)}
                        </div>
                        <span className="text-sm font-bold text-foreground">{transaction.customerName || 'Walk-in Customer'}</span>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className="text-xs font-bold text-muted-foreground">{transaction.cashierId?.name || 'Automated'}</span>
                    </td>
                    <td className="py-6 px-8">
                      <span className="text-sm font-black text-foreground">{formatCurrency(transaction.total)}</span>
                    </td>
                    <td className="py-6 px-8">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20 group-hover:scale-105 transition-transform">
                        {transaction.paymentMethod}
                      </span>
                    </td>
                    <td className="py-6 px-8">
                      <span className="text-xs font-bold text-muted-foreground">{new Date(transaction.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
