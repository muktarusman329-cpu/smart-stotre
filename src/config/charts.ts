import { UserRole } from '@/lib/rbac';

export interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  roles: UserRole[];
  description?: string;
}

export const CHART_CONFIGS: ChartConfig[] = [
  // Admin Charts
  {
    id: 'daily-sales',
    title: 'Daily Sales',
    type: 'line',
    roles: ['admin'],
    description: 'Daily sales revenue over time'
  },
  {
    id: 'weekly-sales',
    title: 'Weekly Sales',
    type: 'bar',
    roles: ['admin'],
    description: 'Weekly sales comparison'
  },
  {
    id: 'monthly-sales',
    title: 'Monthly Sales',
    type: 'line',
    roles: ['admin'],
    description: 'Monthly sales trend'
  },
  {
    id: 'top-selling-products',
    title: 'Top Selling Products',
    type: 'bar',
    roles: ['admin'],
    description: 'Best performing products'
  },
  {
    id: 'sales-by-category',
    title: 'Sales by Category',
    type: 'pie',
    roles: ['admin'],
    description: 'Revenue distribution by product category'
  },
  {
    id: 'revenue-trend',
    title: 'Revenue Trend',
    type: 'area',
    roles: ['admin'],
    description: 'Overall revenue growth trend'
  },
  {
    id: 'inventory-value',
    title: 'Inventory Value',
    type: 'bar',
    roles: ['admin'],
    description: 'Total inventory value by category'
  },
  {
    id: 'customer-growth',
    title: 'Customer Growth',
    type: 'line',
    roles: ['admin'],
    description: 'New customer acquisition over time'
  },
  
  // Manager Charts
  {
    id: 'daily-sales',
    title: 'Daily Sales',
    type: 'line',
    roles: ['manager'],
    description: 'Daily sales revenue over time'
  },
  {
    id: 'inventory-status',
    title: 'Inventory Status',
    type: 'bar',
    roles: ['manager'],
    description: 'Current inventory levels by category'
  },
  {
    id: 'top-selling-products',
    title: 'Top Selling Products',
    type: 'bar',
    roles: ['manager'],
    description: 'Best performing products'
  },
  {
    id: 'category-performance',
    title: 'Category Performance',
    type: 'pie',
    roles: ['manager'],
    description: 'Sales performance by category'
  },
  {
    id: 'low-stock-trend',
    title: 'Low Stock Trend',
    type: 'line',
    roles: ['manager'],
    description: 'Low stock items over time'
  },
  
  // Cashier Charts
  {
    id: 'shift-performance',
    title: 'Shift Performance',
    type: 'bar',
    roles: ['cashier'],
    description: 'Sales performance by shift'
  },
  {
    id: 'hourly-sales',
    title: 'Hourly Sales',
    type: 'line',
    roles: ['cashier'],
    description: 'Sales distribution throughout the day'
  },
  {
    id: 'payment-methods',
    title: 'Payment Methods',
    type: 'pie',
    roles: ['cashier'],
    description: 'Payment method distribution'
  },
];

export function getChartsByRole(role: UserRole): ChartConfig[] {
  return CHART_CONFIGS.filter(chart => chart.roles.includes(role));
}

export function getChartById(id: string): ChartConfig | undefined {
  return CHART_CONFIGS.find(chart => chart.id === id);
}
