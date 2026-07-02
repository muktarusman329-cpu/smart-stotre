'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { getCustomerById, getCustomerPurchaseHistory } from '@/lib/actions/customers';
import { ArrowLeft, Phone, Mail, MapPin, ShoppingBag, Award, Calendar, TrendingUp, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';

interface Customer {
  _id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  customerType: 'walk-in' | 'registered' | 'vip' | 'corporate';
  loyaltyPoints: number;
  totalSpent: number;
  purchaseCount: number;
  lastPurchaseDate: string;
  favoriteProducts: any[];
  favoriteCategories: any[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Sale {
  _id: string;
  saleNumber: string;
  items: any[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  cashierId: {
    name: string;
  };
  branchId: {
    name: string;
  };
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);
        const [customerData, historyData] = await Promise.all([
          getCustomerById(id),
          getCustomerPurchaseHistory(id),
        ]);
        setCustomer(customerData);
        setPurchaseHistory(historyData);
      } catch (err) {
        console.error('Error loading customer data:', err);
        setError('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        <DashboardHeader title="Customer Details" userRole="manager" />
        <main className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        <DashboardHeader title="Customer Details" userRole="manager" />
        <main className="p-8">
          <div className="text-center text-red-600">{error || 'Customer not found'}</div>
        </main>
      </div>
    );
  }

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'vip':
        return 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400';
      case 'corporate':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'registered':
        return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      default:
        return 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <DashboardHeader title="Customer Details" userRole="manager" />
      
      <main className="p-8">
        {/* Back Button */}
        <Link 
          href="/dashboard/customers"
          className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-semibold">Back to Customers</span>
        </Link>

        {/* Customer Header */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-blue-200 dark:shadow-none">
                {customer.name?.charAt(0) || 'C'}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                  {customer.name || 'Walk-in Customer'}
                </h1>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getCustomerTypeColor(customer.customerType)}`}>
                    {customer.customerType}
                  </span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    ID: {customer.customerId}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="px-6 py-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                Edit
              </button>
              <button className="px-6 py-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl font-bold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(customer.totalSpent)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loyalty Points</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {customer.loyaltyPoints}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchases</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {customer.purchaseCount}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Purchase</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {customer.lastPurchaseDate 
                ? new Date(customer.lastPurchaseDate).toLocaleDateString()
                : 'Never'
              }
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{customer.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {customer.email || 'No email provided'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 md:col-span-2">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {customer.address || 'No address provided'}
                </p>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-slate-700 dark:text-slate-300">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Purchase History */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Purchase History</h2>
          
          {purchaseHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-semibold">No purchase history yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseHistory.map((sale) => (
                <div 
                  key={sale._id}
                  className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {sale.saleNumber}
                      </p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {formatCurrency(sale.total)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        sale.paymentStatus === 'paid' 
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {sale.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                        {sale.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cashier</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {sale.cashierId?.name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Items ({sale.items.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {sale.items.slice(0, 3).map((item, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-white dark:bg-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {item.productName} x{item.quantity}
                        </span>
                      ))}
                      {sale.items.length > 3 && (
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-600 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400">
                          +{sale.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
