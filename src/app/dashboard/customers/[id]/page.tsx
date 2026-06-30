import { DashboardHeader } from '@/components/dashboard-header';
import { getCustomerById, getCustomerPurchaseHistory } from '@/lib/actions/customers';
import { ArrowLeft, Phone, Mail, Calendar, ShoppingBag, Award, DollarSign, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Purchase {
  _id: string;
  saleNumber: string;
  date: string;
  total: number;
  paymentMethod: string;
  cashier: string;
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomerById(params.id);
  const purchaseHistory = await getCustomerPurchaseHistory(params.id) as Purchase[];

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        <DashboardHeader title="Customer Not Found" userRole="manager" />
        <main className="p-8">
          <Link href="/dashboard/customers" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-bold mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Customers</span>
          </Link>
          <p className="text-slate-600 dark:text-slate-400 font-semibold">Customer not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <DashboardHeader title="Customer Details" userRole="manager" />
      
      <main className="p-8">
        {/* Back Button */}
        <Link href="/dashboard/customers" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-bold mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </Link>

        {/* Customer Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-200 dark:shadow-none mb-6">
                  {customer.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{customer.name}</h2>
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {String(customer.customerId)}
                  </p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    customer.customerType === 'vip' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' :
                    customer.customerType === 'corporate' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                    customer.customerType === 'registered' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                    'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400'
                  }`}>
                    {customer.customerType || 'walk-in'}
                  </span>
                </div>

                <div className="w-full space-y-4">
                  <div className="flex items-center justify-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center justify-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center justify-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{customer.address}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Since {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3 mb-4">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Spent</p>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(customer.totalSpent)}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3 mb-4">
                  <ShoppingBag className="h-6 w-6 text-blue-500" />
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Visits</p>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{customer.purchaseCount}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3 mb-4">
                  <Award className="h-6 w-6 text-orange-500" />
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Loyalty Points</p>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{customer.loyaltyPoints}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-4">Customer Insights</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Average Spend</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {customer.purchaseCount > 0 ? formatCurrency(customer.totalSpent / customer.purchaseCount) : formatCurrency(0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Last Purchase</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Purchase History</h3>
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-1">
              {purchaseHistory.length} transaction{purchaseHistory.length !== 1 ? 's' : ''}
            </p>
          </div>

          {purchaseHistory.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold">No purchase history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left py-6 px-8 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Sale #</th>
                    <th className="text-left py-6 px-8 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Date</th>
                    <th className="text-left py-6 px-8 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Items</th>
                    <th className="text-left py-6 px-8 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Total</th>
                    <th className="text-left py-6 px-8 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Payment</th>
                    <th className="text-left py-6 px-8 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Cashier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {purchaseHistory.map((sale: Purchase) => (
                    <tr key={sale._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-6 px-8">
                        <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {sale.saleNumber}
                        </p>
                      </td>
                      <td className="py-6 px-8">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          {new Date(sale.createdAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="py-6 px-8">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{sale.items.length} items</p>
                      </td>
                      <td className="py-6 px-8">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(sale.total)}</p>
                      </td>
                      <td className="py-6 px-8">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {sale.cashierId?.name || 'N/A'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
