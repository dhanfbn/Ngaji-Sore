import { googleSheetsService } from './googleSheets.service';
import { parseFlexibleDate } from '@/lib/date';
import { getBadgeLabel } from '@/lib/kpi';
import type { KPIEntry, ChartDataPoint, LessonPlanData, HomeworkItem } from '@/types/dashboard';
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
  periode: string;
  semester: string;
}

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad', 'Minggu'];
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

/** Finds the Lesson_Plan_Mingguan row whose date range covers today, if the guru has filled it in. */
function findCurrentWeekPlan(lessonPlans: LessonPlanMingguanRow[], today: Date): LessonPlanMingguanRow | undefined {
  return lessonPlans.find(p => {
    const start = parseFlexibleDate(p.tanggal_mulai);
    const end = parseFlexibleDate(p.tanggal_selesai);
    return start && end && today >= start && today <= end;
  });
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

export async function getDashboardData(id_santri: string): Promise<DashboardData> {
  const [santri, kehadiran, ziyadah, murojaah, tibyan, tarbiyyah, adabHarian, progres, catatan, tugas] = await Promise.all([
    googleSheetsService.getSantriById(id_santri),
    googleSheetsService.getKehadiranBySantri(id_santri),
    googleSheetsService.getZiyadahBySantri(id_santri),
    googleSheetsService.getMurojaahBySantri(id_santri),
    googleSheetsService.getTibyanBySantri(id_santri),
    googleSheetsService.getTarbiyyahBySantri(id_santri),
    googleSheetsService.getAdabHarianBySantri(id_santri),
    googleSheetsService.getProgresMingguanBySantri(id_santri),
    googleSheetsService.getCatatanAnakBySantri(id_santri),
    googleSheetsService.getTugasRumahBySantri(id_santri),
  ]);

  const lessonPlans = santri?.id_kelas ? await googleSheetsService.getLessonPlanByKelas(santri.id_kelas) : [];

  // --- Kehadiran: computed live from raw attendance (always available, exact) ---
  const totalKehadiran = kehadiran.length;
  const hadirCount = kehadiran.filter(k => k.status.toLowerCase() === 'hadir').length;
  const kehadiranPct = totalKehadiran > 0 ? Math.round((hadirCount / totalKehadiran) * 100) : 0;

  // --- Everything else: latest manually-aggregated week from Progres_Mingguan ---
  // (per CLAUDE.md: these percentages must NOT be recomputed on-the-fly from raw rows)
  const progresSorted = [...progres].sort((a, b) => b.minggu_ke - a.minggu_ke);
  const latestProgres = progresSorted[0];

  const latestZiyadah = sortByDateDesc(ziyadah, z => z.tanggal)[0];
  const latestMurojaah = sortByDateDesc(murojaah, m => m.tanggal)[0];
  const latestTibyan = sortByDateDesc(tibyan, t => t.tanggal)[0];
  const latestTarbiyyah = sortByDateDesc(tarbiyyah, t => t.tanggal)[0];
  const latestAdab = sortByDateDesc(adabHarian, a => a.tanggal)[0];

  const kpi: KPIEntry[] = [
    makeKPI('kehadiran', 'Kehadiran', kehadiranPct, `Hadir ${hadirCount} dari ${totalKehadiran} pertemuan`),
    makeKPI('ziyadah', 'Ziyadah', latestProgres?.ziyadah_pct ?? 0,
      latestZiyadah ? `${latestZiyadah.surat} Ayat ${latestZiyadah.ayat_dari}-${latestZiyadah.ayat_sampai}` : 'Belum ada data'),
    makeKPI('murojaah', 'Murojaah', latestProgres?.murojaah_pct ?? 0,
      latestMurojaah ? `${latestMurojaah.surat_diulang} · ${latestMurojaah.status_kelancaran}` : 'Belum ada data'),
    makeKPI('tibyan', 'Tibyan', latestProgres?.tibyan_pct ?? 0,
      latestTibyan?.materi_huruf ? `${latestTibyan.materi_huruf}` : 'Belum ada data'),
    makeKPI('tarbiyyah', 'Tarbiyyah', latestProgres?.tarbiyyah_pct ?? 0,
      latestTarbiyyah?.tema ? `${latestTarbiyyah.tema}` : 'Belum ada data'),
    makeKPI('adab', 'Adab Harian', latestProgres?.adab_pct ?? 0,
      latestAdab ? `${latestAdab.kategori}: ${latestAdab.nilai}` : 'Belum ada data'),
  ];

  // --- 4-week chart: trailing weeks from the manual Progres_Mingguan history ---
  const chartData: ChartDataPoint[] = [...progres]
    .sort((a, b) => a.minggu_ke - b.minggu_ke)
    .slice(-4)
    .map(p => ({
      week: `Mg. ${p.minggu_ke}`,
      kehadiran: p.kehadiran_pct,
      ziyadah: p.ziyadah_pct,
      murojaah: p.murojaah_pct,
      tibyan: p.tibyan_pct,
      tarbiyyah: p.tarbiyyah_pct,
      adab: p.adab_pct,
    }));

  // --- Lesson plan for the current week, with a mandatory fallback when unfilled ---
  const today = new Date();
  const currentWeekRow = findCurrentWeekPlan(lessonPlans, today);

  const lessonPlan: LessonPlanData = currentWeekRow
    ? {
        tema: currentWeekRow.tema_minggu,
        hari: lessonPlans
          .filter(p => p.minggu_ke === currentWeekRow.minggu_ke)
          .sort((a, b) => HARI_ORDER.indexOf(a.hari) - HARI_ORDER.indexOf(b.hari))
          .map(p => ({ hari: p.hari, kategori: p.kategori, materi: p.materi ?? '' })),
      }
    : { hari: [] };

  // --- Catatan anak: newest first ---
  const notes = sortByDateDesc(catatan, c => c.tanggal);

  // --- Tugas rumah: normalize status case ---
  const homework: HomeworkItem[] = tugas.map(t => ({
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

export async function getHeaderInfo(id_santri: string): Promise<HeaderInfo> {
  const santri = await googleSheetsService.getSantriById(id_santri);
  const [kelas, lessonPlans] = await Promise.all([
    santri?.id_kelas ? googleSheetsService.getKelasById(santri.id_kelas) : null,
    santri?.id_kelas ? googleSheetsService.getLessonPlanByKelas(santri.id_kelas) : Promise.resolve([]),
  ]);

  const today = new Date();
  const currentWeekRow = findCurrentWeekPlan(lessonPlans, today);
  const periode = currentWeekRow
    ? formatPeriodeRange(parseFlexibleDate(currentWeekRow.tanggal_mulai)!, parseFlexibleDate(currentWeekRow.tanggal_selesai)!)
    : 'Belum tersedia';

  return {
    studentName: santri?.nama || 'Santri',
    kelasNama: kelas?.nama_kelas || santri?.id_kelas || '-',
    kelasId: santri?.id_kelas || '',
    periode,
    semester: getSemesterLabel(today),
  };
}
