import { googleSheetsService } from '@/services/db.service';
import { parseFlexibleDate } from '@/lib/date';
import type { WeekOption } from '@/types/dashboard';
import type { LessonPlanMingguanRow } from '@/types/database';

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatPeriodeRange(start: Date, end: Date): string {
  const d1 = start.getDate(), d2 = end.getDate();
  const m1 = BULAN[start.getMonth()], m2 = BULAN[end.getMonth()];
  const y1 = start.getFullYear(), y2 = end.getFullYear();
  if (y1 === y2 && m1 === m2) return `${d1} – ${d2} ${m1} ${y1}`;
  if (y1 === y2) return `${d1} ${m1} – ${d2} ${m2} ${y1}`;
  return `${d1} ${m1} ${y1} – ${d2} ${m2} ${y2}`;
}

/** Selectable weeks for the dropdown, sourced from Lesson_Plan_Mingguan for the class, newest first. */
export async function getWeeksForKelas(id_kelas: string | undefined): Promise<{ weeks: WeekOption[]; lessonPlans: LessonPlanMingguanRow[] }> {
  const lessonPlans = id_kelas ? await googleSheetsService.getLessonPlanByKelas(id_kelas) : [];

  const firstRowPerWeek = new Map<string, LessonPlanMingguanRow>();
  for (const p of lessonPlans) {
    if (!firstRowPerWeek.has(p.key_minggu)) firstRowPerWeek.set(p.key_minggu, p);
  }

  const weeks: WeekOption[] = [...firstRowPerWeek.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])) // "2026-W29" > "2026-W01" sorts correctly as plain strings
    .map(([key, row]) => {
      const start = parseFlexibleDate(row.tanggal_mulai);
      const end = parseFlexibleDate(row.tanggal_selesai);
      return { key, label: start && end ? formatPeriodeRange(start, end) : key };
    });

  return { weeks, lessonPlans };
}
