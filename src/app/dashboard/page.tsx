import { redirect } from 'next/navigation';
import { CalendarDays, BookOpen, Star, HeartHandshake } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { AchievementTable } from '@/components/dashboard/AchievementTable';
import { TeacherNotes } from '@/components/dashboard/TeacherNotes';
import { getDashboardData } from '@/services/dashboard.service';
import { getSession } from '@/lib/session';

export const revalidate = 300; // Cache for 5 minutes

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const data = await getDashboardData(userId);
  const { kpi, chartData, currentTargets, nextTargets, notes, studentName } = data;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Greeting ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Assalamu&apos;alaikum, {studentName}! ✨
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Berikut ringkasan perkembangan ngaji kamu sejauh ini.
        </p>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <section aria-label="Ringkasan KPI">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <KPICard
            title="Kehadiran"
            value={kpi.kehadiran.pct}
            detail={kpi.kehadiran.detail}
            label={kpi.kehadiran.label}
            icon={CalendarDays}
            color="blue"
            trend="up"
          />
          <KPICard
            title="Tilawah"
            value={kpi.tilawah.pct}
            detail={kpi.tilawah.detail}
            label={kpi.tilawah.label}
            icon={BookOpen}
            color="green"
            trend="up"
          />
          <KPICard
            title="Hafalan (Tahfiz)"
            value={kpi.tahfiz.pct}
            detail={kpi.tahfiz.detail}
            label={kpi.tahfiz.label}
            icon={Star}
            color="yellow"
            trend="flat"
          />
          <KPICard
            title="Adab & Doa"
            value={kpi.adab.pct}
            detail={kpi.adab.detail}
            label={kpi.adab.label}
            icon={HeartHandshake}
            color="purple"
            trend="up"
          />
        </div>
      </section>

      {/* ── Chart + Teacher Notes ─────────────────────────────── */}
      <section aria-label="Grafik perkembangan dan catatan guru">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Chart: 2 cols on lg */}
          <div className="lg:col-span-2 min-h-[380px]">
            <ProgressChart data={chartData} />
          </div>
          {/* Teacher Notes: 1 col on lg, max-height to match chart */}
          <div className="max-h-[420px] lg:max-h-none">
            <TeacherNotes notes={notes} />
          </div>
        </div>
      </section>

      {/* ── Achievement Tables ────────────────────────────────── */}
      <section aria-label="Capaian dan target santri">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <AchievementTable
            title="Capaian Saat Ini"
            icon="🏆"
            data={currentTargets}
          />
          <AchievementTable
            title="Target Selanjutnya"
            icon="🎯"
            data={nextTargets}
            isTarget
          />
        </div>
      </section>

    </div>
  );
}
