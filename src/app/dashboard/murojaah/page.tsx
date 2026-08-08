import { redirect } from 'next/navigation';
import { MessageCircle, Target } from 'lucide-react';
import { MurojaahSummaryCard } from '@/components/murojaah/MurojaahSummaryCard';
import { MurojaahPencapaianCard } from '@/components/murojaah/MurojaahPencapaianCard';
import { MurojaahLogTable } from '@/components/murojaah/MurojaahLogTable';
import { ZiyadahNoteCard } from '@/components/ziyadah/ZiyadahNoteCard';
import { MonthSelect } from '@/components/kehadiran/MonthSelect';
import { getMurojaahDetail } from '@/services/dashboard.service';
import { getSession } from '@/lib/session';

export const revalidate = 300; // Cache for 5 minutes

interface MurojaahPageProps {
  searchParams: Promise<{ bulan?: string }>;
}

export default async function MurojaahPage({ searchParams }: MurojaahPageProps) {
  const session = await getSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  const { bulan } = await searchParams;
  const userId = session.user.id;
  const data = await getMurojaahDetail(userId, bulan);
  const { studentName, months, selectedMonth, monthLabel, summary, pencapaian, log, catatanStrategi, targetPekanDepan } = data;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Greeting ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Murojaah</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Ringkasan pencapaian murojaah (pengulangan hafalan) {studentName}.
          </p>
        </div>
        <MonthSelect months={months} selectedMonth={selectedMonth} />
      </div>

      {months.length === 0 ? (
        <div className="card-3d bg-white rounded-3xl p-10 flex flex-col items-center justify-center gap-2 text-center">
          <span className="text-4xl opacity-80" aria-hidden="true">🍃</span>
          <p className="text-sm font-semibold text-slate-400">Belum ada data murojaah yang tercatat</p>
        </div>
      ) : (
        <>
          {/* ── Ringkasan / Analisis Kelancaran ──────────────────── */}
          <section aria-label="Ringkasan murojaah">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:items-stretch">
              <MurojaahSummaryCard monthLabel={monthLabel} summary={summary} />
              <MurojaahPencapaianCard pencapaian={pencapaian} />
            </div>
          </section>

          {/* ── Log Harian ──────────────────────────────────────── */}
          <section aria-label="Log murojaah harian">
            <MurojaahLogTable monthLabel={monthLabel} log={log} />
          </section>

          {/* ── Catatan Strategi / Target Pekan Depan ────────────── */}
          <section aria-label="Catatan strategi dan target pekan depan">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:items-stretch">
              <ZiyadahNoteCard
                icon={MessageCircle}
                pillColor="bg-sky-500"
                iconColor="text-sky-500"
                boxColor="border-sky-100 bg-sky-50/60"
                title="Catatan Strategi Murojaah dari Guru"
                text={catatanStrategi}
              />
              <ZiyadahNoteCard
                icon={Target}
                pillColor="bg-violet-500"
                iconColor="text-violet-500"
                boxColor="border-violet-100 bg-violet-50/60"
                title="Target Pekan Depan"
                text={targetPekanDepan}
              />
            </div>
          </section>
        </>
      )}

    </div>
  );
}
