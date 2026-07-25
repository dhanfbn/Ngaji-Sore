import { redirect } from 'next/navigation';
import { AttendanceSummaryCard } from '@/components/kehadiran/AttendanceSummaryCard';
import { AttendanceClassificationCard } from '@/components/kehadiran/AttendanceClassificationCard';
import { AttendanceCalendarCard } from '@/components/kehadiran/AttendanceCalendarCard';
import { AttendanceLogTable } from '@/components/kehadiran/AttendanceLogTable';
import { MonthSelect } from '@/components/kehadiran/MonthSelect';
import { getKehadiranDetail } from '@/services/dashboard.service';
import { getSession } from '@/lib/session';

export const revalidate = 300; // Cache for 5 minutes

interface KehadiranPageProps {
  searchParams: Promise<{ bulan?: string }>;
}

export default async function KehadiranPage({ searchParams }: KehadiranPageProps) {
  const session = await getSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  const { bulan } = await searchParams;
  const userId = session.user.id;
  const data = await getKehadiranDetail(userId, bulan);
  const { studentName, months, selectedMonth, monthLabel, summary, calendarDays, log } = data;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Greeting ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Kehadiran</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Ringkasan kehadiran dan ketepatan waktu {studentName}.
          </p>
        </div>
        <MonthSelect months={months} selectedMonth={selectedMonth} />
      </div>

      {months.length === 0 ? (
        <div className="card-3d bg-white rounded-3xl p-10 flex flex-col items-center justify-center gap-2 text-center">
          <span className="text-4xl opacity-80" aria-hidden="true">🍃</span>
          <p className="text-sm font-semibold text-slate-400">Belum ada data kehadiran yang tercatat</p>
        </div>
      ) : (
        <>
          {/* ── Ringkasan / Klasifikasi / Kalender ─────────────── */}
          <section aria-label="Ringkasan kehadiran">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:items-stretch">
              <AttendanceSummaryCard monthLabel={monthLabel} summary={summary} />
              <AttendanceClassificationCard summary={summary} />
              <AttendanceCalendarCard monthLabel={monthLabel} calendarDays={calendarDays} />
            </div>
          </section>

          {/* ── Log Harian ──────────────────────────────────────── */}
          <section aria-label="Log kehadiran harian">
            <AttendanceLogTable monthLabel={monthLabel} log={log} />
          </section>
        </>
      )}

    </div>
  );
}
