import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { getSession } from '@/lib/session';
import { getHeaderInfo } from '@/services/dashboard.service';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !session.user) {
    redirect('/login');
  }

  const headerInfo = await getHeaderInfo(session.user.id);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar kelasId={headerInfo.kelasId} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          studentName={headerInfo.studentName}
          kelasNama={headerInfo.kelasNama}
          kelasId={headerInfo.kelasId}
          periode={headerInfo.periode}
          semester={headerInfo.semester}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
