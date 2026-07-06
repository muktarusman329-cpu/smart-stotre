import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { FloatingActionButton } from '@/components/floating-action-button';
import { PageTransition } from '@/components/page-transition';
import { ActivityTracker } from '@/components/activity-tracker';
import { UserRole } from '@/lib/rbac';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user.role as UserRole) || 'cashier';

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 overflow-x-hidden">
      <ActivityTracker />
      <DashboardSidebar userRole={userRole} userName={session.user.name || undefined} />
      <div className="min-h-screen transition-all duration-300 lg:ml-72">
        <PageTransition>
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </PageTransition>
      </div>
      <FloatingActionButton />
    </div>
  );
}
