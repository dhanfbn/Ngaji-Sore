import { googleSheetsService } from './googleSheets.service';
import { parseFlexibleDate } from '@/lib/date';
import { getBadgeLabel } from '@/lib/kpi';
import type { KPIEntry, ChartDataPoint, LessonPlanData, HomeworkItem } from '@/types/dashboard';
import type { CatatanAnakRow } from '@/types/database';

export interface DashboardData {
  kpi: KPIEntry[];
  chartData: ChartDataPoint[];
  lessonPlan: LessonPlanData;
  notes: CatatanAnakRow[];
  homework: HomeworkItem[];
  studentName: string;
}

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad', 'Minggu'];

function sortByDateDesc<T>(rows: T[], getDate: (row: T) => string): T[] {
  return [...rows].sort((a, b) => {
    const ta = parseFlexibleDate(getDate(a))?.getTime() ?? 0;
    const tb = parseFlexibleDate(getDate(b))?.getTime() ?? 0;
    return tb - ta;
  });
}

function makeKPI(key: string, label: string, value: number, detail: string): KPIEntry {
  return { key, label, value, unit: '%', detail, badge: getBadgeLabel(value), locked: false };
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
  const currentWeekRow = lessonPlans.find(p => {
    const start = parseFlexibleDate(p.tanggal_mulai);
    const end = parseFlexibleDate(p.tanggal_selesai);
    return start && end && today >= start && today <= end;
  });

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
