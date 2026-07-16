'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Calendar, TrendingUp, DollarSign, ShoppingCart, BarChart3, Activity } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function SalesAnalyticsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalProfit: 0,
    avgTransaction: 0,
    revenueChange: 0,
    salesChange: 0,
    profitChange: 0,
    avgChange: 0
  });
  const fetchSalesData = async () => {
    try {
      const response = await fetch(`/api/sales/analytics?period=${period}`);
      const data = await response.json();
      if (data.success) {
        setSalesData(data.data.chartData);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [period]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <DashboardHeader title="Advanced Analytics" userRole="admin" />
      
      <main className="p-8">
        {/* Period Selector */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Revenue Intel</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Deep dive into your supermarket's financial trajectory.</p>
          </div>
          <div className="flex items-center bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="group bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Gross Revenue</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</h3>
                <p className={`text-[10px] font-black mt-2 uppercase tracking-widest flex items-center ${stats.revenueChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueChange).toFixed(1)}% Velocity
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                <DollarSign className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="group bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Sales Volume</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalSales.toLocaleString()}</h3>
                <p className={`text-[10px] font-black mt-2 uppercase tracking-widest flex items-center ${stats.salesChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.salesChange >= 0 ? '↑' : '↓'} {Math.abs(stats.salesChange).toFixed(1)}% Volume
                </p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
                <Activity className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="group bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Net Earnings</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(stats.totalProfit)}</h3>
                <p className={`text-[10px] font-black mt-2 uppercase tracking-widest flex items-center ${stats.profitChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.profitChange >= 0 ? '↑' : '↓'} {Math.abs(stats.profitChange).toFixed(1)}% Efficiency
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-2xl">
                <TrendingUp className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="group bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Avg. Basket</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(stats.avgTransaction)}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Per user session</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl">
                <BarChart3 className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-10 hover:shadow-xl transition-all duration-500">
            <div className="flex items-center space-x-3 mb-10">
              <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Revenue Trajectory</h3>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.2)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₦${value}`} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                    labelStyle={{ fontWeight: 900, marginBottom: '4px', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales vs Profit */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-10 hover:shadow-xl transition-all duration-500">
            <div className="flex items-center space-x-3 mb-10">
              <div className="h-6 w-1.5 bg-emerald-500 rounded-full"></div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Profitability Matrix</h3>
            </div>
            <div className="h-[350px] w-full text-white">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.2)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  <Bar dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} name="Volume" />
                  <Bar dataKey="profit" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
