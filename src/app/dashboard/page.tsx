import { redirect } from 'next/navigation';
import { CalendarDays, BookOpen, RotateCcw, Type, GraduationCap, HeartHandshake, LucideIcon } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { TeacherNotes } from '@/components/dashboard/TeacherNotes';
import { LessonPlanCard } from '@/components/dashboard/LessonPlan';
import { HomeworkList } from '@/components/dashboard/HomeworkList';
import { getDashboardData } from '@/services/dashboard.service';
import { getSession } from '@/lib/session';

export const revalidate = 300; // Cache for 5 minutes

const KPI_DISPLAY: Record<string, { icon: LucideIcon; color: 'blue' | 'green' | 'yellow' | 'purple' | 'rose' | 'cyan' }> = {
  kehadiran: { icon: CalendarDays, color: 'blue' },
  ziyadah: { icon: BookOpen, color: 'green' },
  murojaah: { icon: RotateCcw, color: 'cyan' },
  tibyan: { icon: Type, color: 'yellow' },
  tarbiyyah: { icon: GraduationCap, color: 'purple' },
  adab: { icon: HeartHandshake, color: 'rose' },
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  const data = await getDashboardData(userId);
  const { kpi, chartData, lessonPlan, notes, homework, studentName } = data;

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
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {kpi.map(entry => {
            const display = KPI_DISPLAY[entry.key];
            return (
              <KPICard
                key={entry.key}
                title={entry.label}
                value={entry.value}
                detail={entry.detail}
                label={entry.badge}
                icon={display.icon}
                color={display.color}
                locked={entry.locked}
              />
            );
          })}
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

      {/* ── Lesson Plan + Tugas Rumah ──────────────────────────── */}
      <section aria-label="Lesson plan mingguan dan tugas di rumah">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <LessonPlanCard tema={lessonPlan.tema} hari={lessonPlan.hari} />
          <HomeworkList data={homework} />
        </div>
      </section>

    </div>
  );
}
