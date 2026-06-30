import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { FloatingActionButton } from '@/components/floating-action-button';
import { PageTransition } from '@/components/page-transition';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 overflow-x-hidden">
      <DashboardSidebar userRole={session.user.role} userName={session.user.name || undefined} />
      <div className="lg:ml-64 min-h-screen">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
      <FloatingActionButton />
    </div>
  );
}
