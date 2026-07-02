import { DashboardHeader } from '@/components/dashboard-header';
import { getCustomerAnalytics } from '@/lib/actions/customers';
import { TrendingUp, Users, DollarSign, Award, Repeat, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  totalSpent: number;
  purchaseCount: number;
}

interface LoyaltyLevel {
  name: string;
  count: number;
  percentage: number;
}

interface Analytics {
  totalCustomers: number;
  totalRevenue: number;
  averageSpend: number;
  totalPoints: number;
  topSpenders: Customer[];
  frequentCustomers: Customer[];
  newCustomers: number;
  returningCustomers: number;
  returningRate: string;
  recentPurchases: number;
  loyaltyLevels: LoyaltyLevel[];
}

export default async function CustomerAnalyticsPage() {
  const analytics = await getCustomerAnalytics() as Analytics;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <DashboardHeader title="Customer Analytics" userRole="manager" />
      
      <main className="p-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Customers</p>
                <h3 className="text-3xl font-black text-foreground mt-2">{analytics.totalCustomers}</h3>
                <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-3xl font-black text-foreground mt-2">{formatCurrency(analytics.totalRevenue)}</h3>
                <p className="text-xs text-muted-foreground mt-1">Lifetime value</p>
              </div>
              <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Avg. Spend</p>
                <h3 className="text-3xl font-black text-foreground mt-2">{formatCurrency(analytics.averageSpend)}</h3>
                <p className="text-xs text-muted-foreground mt-1">Per customer</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Points</p>
                <h3 className="text-3xl font-black text-foreground mt-2">{analytics.totalPoints}</h3>
                <p className="text-xs text-muted-foreground mt-1">Loyalty points</p>
              </div>
              <div className="h-12 w-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Top Customers by Spending */}
          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-black text-foreground uppercase">Top Customers by Spending</h3>
              <p className="text-sm text-muted-foreground mt-1">Highest lifetime value</p>
            </div>
            <div className="divide-y divide-border">
              {analytics.topSpenders.slice(0, 5).map((customer: Customer, index: number) => (
                <div key={customer._id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-black text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-foreground">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">{customer.purchaseCount} purchases</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Frequent Customers */}
          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-black text-foreground uppercase">Most Frequent Customers</h3>
              <p className="text-sm text-muted-foreground mt-1">Highest purchase count</p>
            </div>
            <div className="divide-y divide-border">
              {analytics.frequentCustomers.slice(0, 5).map((customer: Customer, index: number) => (
                <div key={customer._id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-sm font-black text-emerald-500">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-foreground">{customer.purchaseCount} visits</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-10">
          <h3 className="text-lg font-black text-foreground uppercase mb-6">Customer Segments</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-secondary/50 rounded-xl border border-border">
              <div className="flex items-center space-x-3 mb-4">
                <Repeat className="h-6 w-6 text-primary" />
                <h4 className="font-bold text-foreground">Returning Customers</h4>
              </div>
              <p className="text-3xl font-black text-foreground">{analytics.returningCustomers}</p>
              <p className="text-sm text-muted-foreground mt-1">{analytics.returningRate}% of total</p>
            </div>

            <div className="p-6 bg-secondary/50 rounded-xl border border-border">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-6 w-6 text-emerald-500" />
                <h4 className="font-bold text-foreground">New Customers</h4>
              </div>
              <p className="text-3xl font-black text-foreground">{analytics.newCustomers}</p>
              <p className="text-sm text-muted-foreground mt-1">Last 30 days</p>
            </div>

            <div className="p-6 bg-secondary/50 rounded-xl border border-border">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="h-6 w-6 text-orange-500" />
                <h4 className="font-bold text-foreground">Recent Activity</h4>
              </div>
              <p className="text-3xl font-black text-foreground">{analytics.recentPurchases}</p>
              <p className="text-sm text-muted-foreground mt-1">Purchases this week</p>
            </div>
          </div>
        </div>

        {/* Loyalty Levels Distribution */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          <h3 className="text-lg font-black text-foreground uppercase mb-6">Loyalty Levels Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {analytics.loyaltyLevels.map((level: LoyaltyLevel) => (
              <div key={level.name} className="p-6 bg-secondary/50 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-foreground capitalize">{level.name}</h4>
                  <span className="text-2xl font-black text-foreground">{level.count}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${level.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{level.percentage}% of customers</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
