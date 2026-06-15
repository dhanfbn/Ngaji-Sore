import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { getSession } from '@/lib/session';
import { googleSheetsService } from '@/services/googleSheets.service';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !session.user) {
    redirect('/login');
  }

  // Fetch full student info for the header
  const santri = await googleSheetsService.getSantriById(session.user.id);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          studentName={santri?.nama || session.user.nama}
          studentClass={santri?.id_kelas || 'Kelas Anak'}
          studentPeriod={santri?.periode_belajar || 'Periode Aktif'}
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
