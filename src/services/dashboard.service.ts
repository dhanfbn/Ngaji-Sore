import { googleSheetsService } from './googleSheets.service';
import { parseFlexibleDate, getISOWeekKey } from '@/lib/date';
import { getBadgeLabel } from '@/lib/kpi';
import type { KPIEntry, ChartDataPoint, LessonPlanData, HomeworkItem, WeekOption } from '@/types/dashboard';
import type { CatatanAnakRow, LessonPlanMingguanRow } from '@/types/database';

export interface DashboardData {
  kpi: KPIEntry[];
  chartData: ChartDataPoint[];
  lessonPlan: LessonPlanData;
  notes: CatatanAnakRow[];
  homework: HomeworkItem[];
  studentName: string;
}

export interface HeaderInfo {
  studentName: string;
  kelasNama: string;
  kelasId: string;
  weeks: WeekOption[];
  defaultWeek: string;
  semester: string;
}

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad', 'Minggu'];
const ADAB_KATEGORI_ORDER = ['Sopan', 'Santun', 'Kedisiplinan'];
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function sortByDateDesc<T>(rows: T[], getDate: (row: T) => string): T[] {
  return [...rows].sort((a, b) => {
    const ta = parseFlexibleDate(getDate(a))?.getTime() ?? 0;
    const tb = parseFlexibleDate(getDate(b))?.getTime() ?? 0;
    return tb - ta;
  });
}

function makeKPI(key: string, label: string, value: number, detail: string): KPIEntry {
  return { key, label, value, unit: '%', detail, badge: getBadgeLabel(value, key), locked: false };
}

/** "2026-W01" -> "Mg. 1" for the chart's X-axis; falls back to the raw key if unparseable. */
function formatWeekLabel(key_minggu: string): string {
  const match = key_minggu.match(/-W(\d{1,2})$/);
  return match ? `Mg. ${Number(match[1])}` : key_minggu;
}

function formatPeriodeRange(start: Date, end: Date): string {
  const d1 = start.getDate(), d2 = end.getDate();
  const m1 = BULAN[start.getMonth()], m2 = BULAN[end.getMonth()];
  const y1 = start.getFullYear(), y2 = end.getFullYear();
  if (y1 === y2 && m1 === m2) return `${d1} – ${d2} ${m1} ${y1}`;
  if (y1 === y2) return `${d1} ${m1} – ${d2} ${m2} ${y1}`;
  return `${d1} ${m1} ${y1} – ${d2} ${m2} ${y2}`;
}

/** Indonesian school calendar convention: Ganjil = Jul–Dec, Genap = Jan–Jun. */
function getSemesterLabel(today: Date): string {
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  return month >= 7 ? `Ganjil ${year}/${year + 1}` : `Genap ${year - 1}/${year}`;
}

/** Selectable weeks for the dropdown, sourced from Lesson_Plan_Mingguan for the class, newest first. */
async function getWeeksForKelas(id_kelas: string | undefined): Promise<{ weeks: WeekOption[]; lessonPlans: LessonPlanMingguanRow[] }> {
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

/** Picks `requested` if it's a valid option, else the current ISO week if it has data, else the latest available week. */
function resolveSelectedWeek(weeks: WeekOption[], requested: string | undefined, today: Date): string {
  if (requested && weeks.some(w => w.key === requested)) return requested;
  const currentWeekKey = getISOWeekKey(today);
  return weeks.find(w => w.key === currentWeekKey)?.key ?? weeks[0]?.key ?? '';
}

export async function getHeaderInfo(id_santri: string): Promise<HeaderInfo> {
  const santri = await googleSheetsService.getSantriById(id_santri);
  const [kelas, { weeks }] = await Promise.all([
    santri?.id_kelas ? googleSheetsService.getKelasById(santri.id_kelas) : Promise.resolve(null),
    getWeeksForKelas(santri?.id_kelas),
  ]);

  return {
    studentName: santri?.nama || 'Santri',
    kelasNama: kelas?.nama_kelas || santri?.id_kelas || '-',
    kelasId: santri?.id_kelas || '',
    weeks,
    defaultWeek: resolveSelectedWeek(weeks, undefined, new Date()),
    semester: getSemesterLabel(new Date()),
  };
}

/** `selectedWeekParam` is the "minggu" URL search param set by the Periode dropdown in Header. */
export async function getDashboardData(id_santri: string, selectedWeekParam?: string): Promise<DashboardData> {
  const santri = await googleSheetsService.getSantriById(id_santri);

  const [kehadiran, ziyadah, murojaah, tibyan, tarbiyyah, adabHarian, progres, catatan, tugas, { weeks, lessonPlans }] = await Promise.all([
    googleSheetsService.getKehadiranBySantri(id_santri),
    googleSheetsService.getZiyadahBySantri(id_santri),
    googleSheetsService.getMurojaahBySantri(id_santri),
    googleSheetsService.getTibyanBySantri(id_santri),
    googleSheetsService.getTarbiyyahBySantri(id_santri),
    googleSheetsService.getAdabHarianBySantri(id_santri),
    googleSheetsService.getProgresMingguanBySantri(id_santri),
    googleSheetsService.getCatatanAnakBySantri(id_santri),
    googleSheetsService.getTugasRumahBySantri(id_santri),
    getWeeksForKelas(santri?.id_kelas),
  ]);

  const weekKey = resolveSelectedWeek(weeks, selectedWeekParam, new Date());

  // --- Kehadiran: live % from the selected week's attendance rows ---
  const weekKehadiran = kehadiran.filter(k => k.key_minggu === weekKey);
  const totalKehadiran = weekKehadiran.length;
  const hadirCount = weekKehadiran.filter(k => k.status.toLowerCase() === 'hadir').length;
  const kehadiranPct = totalKehadiran > 0 ? Math.round((hadirCount / totalKehadiran) * 1000) / 10 : 0;

  // --- Everything else: the selected week's manually-aggregated row from Progres_Mingguan ---
  // (per CLAUDE.md: these percentages must NOT be recomputed on-the-fly from raw rows)
  const weekProgres = progres.find(p => p.key_minggu === weekKey);

  const weekZiyadah = sortByDateDesc(ziyadah.filter(z => z.key_minggu === weekKey), z => z.tanggal)[0];
  const weekMurojaah = sortByDateDesc(murojaah.filter(m => m.key_minggu === weekKey), m => m.tanggal)[0];
  const weekTibyan = sortByDateDesc(tibyan.filter(t => t.key_minggu === weekKey), t => t.tanggal)[0];
  const weekTarbiyyah = sortByDateDesc(tarbiyyah.filter(t => t.key_minggu === weekKey), t => t.tanggal)[0];
  // Adab_Harian has one row per kategori (Sopan / Santun / Kedisiplinan) per week — show all three.
  const weekAdabRows = adabHarian
    .filter(a => a.key_minggu === weekKey)
    .sort((a, b) => ADAB_KATEGORI_ORDER.indexOf(a.kategori) - ADAB_KATEGORI_ORDER.indexOf(b.kategori));

  const kpi: KPIEntry[] = [
    makeKPI('kehadiran', 'Kehadiran', kehadiranPct, totalKehadiran > 0 ? `Hadir ${hadirCount} dari ${totalKehadiran} pertemuan` : 'Belum ada data'),
    makeKPI('ziyadah', 'Ziyadah', weekProgres?.ziyadah_pct ?? 0,
      weekZiyadah ? `${weekZiyadah.surat} Ayat ${weekZiyadah.ayat_dari}-${weekZiyadah.ayat_sampai}` : 'Belum ada data'),
    makeKPI('murojaah', 'Murojaah', weekProgres?.murojaah_pct ?? 0,
      weekMurojaah ? `${weekMurojaah.surat_diulang} · ${weekMurojaah.status_kelancaran}` : 'Belum ada data'),
    makeKPI('tibyan', 'Tibyan', weekProgres?.tibyan_pct ?? 0,
      weekTibyan?.materi_huruf ? `${weekTibyan.materi_huruf}` : 'Belum ada data'),
    makeKPI('tarbiyyah', 'Tarbiyyah', weekProgres?.tarbiyyah_pct ?? 0,
      weekTarbiyyah?.tema ? `${weekTarbiyyah.tema}` : 'Belum ada data'),
    makeKPI('adab', 'Adab Harian', weekProgres?.adab_pct ?? 0,
      weekAdabRows.length > 0 ? weekAdabRows.map(a => `${a.kategori}: ${a.nilai}`).join(', ') : 'Belum ada data'),
  ];

  // --- 4-week chart: trailing weeks from the manual Progres_Mingguan history ---
  // Global trend, intentionally NOT filtered by the Periode dropdown — a single
  // selected week has nothing meaningful to trend against.
  const chartData: ChartDataPoint[] = [...progres]
    .filter(p => p.key_minggu)
    .sort((a, b) => a.key_minggu!.localeCompare(b.key_minggu!))
    .slice(-4)
    .map(p => ({
      week: formatWeekLabel(p.key_minggu!),
      kehadiran: p.kehadiran_pct,
      ziyadah: p.ziyadah_pct,
      murojaah: p.murojaah_pct,
      tibyan: p.tibyan_pct,
      tarbiyyah: p.tarbiyyah_pct,
      adab: p.adab_pct,
    }));

  // --- Lesson plan for the selected week ---
  const weekPlanRows = lessonPlans
    .filter(p => p.key_minggu === weekKey)
    .sort((a, b) => HARI_ORDER.indexOf(a.hari) - HARI_ORDER.indexOf(b.hari));

  const lessonPlan: LessonPlanData = weekPlanRows.length > 0
    ? {
        tema: weekPlanRows[0].tema_minggu,
        hari: weekPlanRows.map(p => ({ hari: p.hari, kategori: p.kategori, materi: p.materi ?? '' })),
      }
    : { hari: [] };

  // --- Catatan anak: the selected week's notes, newest first ---
  // NOTE: Catatan_Anak's sheet column is literally named "minggu_ke" (holds "2026-Wxx" text, not a number).
  const notes = sortByDateDesc(catatan.filter(c => c.minggu_ke === weekKey), c => c.tanggal);

  // --- Tugas rumah: the selected week's homework, normalize status case ---
  const homework: HomeworkItem[] = tugas
    .filter(t => t.key_minggu === weekKey)
    .map(t => ({
      deskripsi: t.deskripsi_tugas,
      status: t.status.toLowerCase().includes('selesai') ? 'selesai' : 'belum',
    }));

  return {
    kpi,
    chartData,
    lessonPlan,
    notes,
    homework,
    studentName: santri?.nama || 'Santri',
  };
}
