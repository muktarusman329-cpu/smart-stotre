import { DashboardHeader } from '@/components/dashboard-header';
import { Receipt } from '@/components/receipt';
import { getSaleById } from '@/lib/actions/pos';

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = await getSaleById(id);

  if (!sale) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Sale not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <DashboardHeader title="Digital Receipt" userRole="cashier" />
      
      <main className="p-8">
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Receipt sale={sale} />
        </div>
      </main>
    </div>
  );
}
