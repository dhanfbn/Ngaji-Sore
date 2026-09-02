import { googleSheetsService } from './db.service';
import { parseFlexibleDate, getISOWeekKey, parseTimeToMinutes } from '@/lib/date';
import { getBadgeLabel } from '@/lib/kpi';
import { getWeeksForKelas } from '@/lib/weeks';
import type {
  KPIEntry, ChartDataPoint, LessonPlanData, HomeworkItem, WeekOption,
  MonthOption, AttendanceCategory, AttendanceCalendarDay, AttendanceLogRow, KehadiranDetailData,
  ZiyadahDetailData, ZiyadahLogRow, ZiyadahStatus, ZiyadahPencapaianLevel,
  MurojaahDetailData, MurojaahLogRow, MurojaahPencapaianLevel,
} from '@/types/dashboard';
import type { CatatanAnakRow } from '@/types/database';

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
const BULAN_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
/** Date.getDay() index (0=Sunday) -> Indonesian day name. */
const HARI_BY_WEEKDAY = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

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

/** Indonesian school calendar convention: Ganjil = Jul–Dec, Genap = Jan–Jun. */
function getSemesterLabel(today: Date): string {
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  return month >= 7 ? `Ganjil ${year}/${year + 1}` : `Genap ${year - 1}/${year}`;
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
  // Only Senin-Jumat count toward the denominator (5 pertemuan/minggu) — some
  // classes' migrated data has a stray Sabtu/Ahad row for the same key_minggu,
  // which would otherwise inflate "X dari Y" past 5.
  const weekKehadiran = kehadiran.filter(k => {
    if (k.key_minggu !== weekKey) return false;
    const day = parseFlexibleDate(k.tanggal)?.getDay();
    return day !== undefined && day >= 1 && day <= 5;
  });
  const totalKehadiran = weekKehadiran.length;
  const hadirCount = weekKehadiran.filter(k => k.status.toLowerCase() === 'hadir').length;
  const kehadiranPct = totalKehadiran > 0 ? Math.round((hadirCount / totalKehadiran) * 1000) / 10 : 0;

  // --- Everything else: the selected week's manually-aggregated row from Progres_Mingguan ---
  // (per CLAUDE.md: these percentages must NOT be recomputed on-the-fly from raw rows)
  const weekProgres = progres.find(p => p.key_minggu === weekKey);

  // Blank placeholder rows (unfilled future/weekend days pre-created by the sheet's
  // weekly template) are excluded so "latest entry" picks real, filled-in data.
  const weekZiyadah = sortByDateDesc(ziyadah.filter(z => z.key_minggu === weekKey && z.surat.trim() !== ''), z => z.tanggal)[0];
  const weekMurojaah = sortByDateDesc(murojaah.filter(m => m.key_minggu === weekKey && m.surat_diulang.trim() !== ''), m => m.tanggal)[0];
  const weekTibyan = sortByDateDesc(tibyan.filter(t => t.key_minggu === weekKey && (t.progres > 0 || t.target > 0 || (t.materi_huruf ?? '').trim() !== '')), t => t.tanggal)[0];
  const weekTarbiyyah = sortByDateDesc(tarbiyyah.filter(t => t.key_minggu === weekKey && ((t.tema ?? '').trim() !== '' || (t.status_capaian ?? '').trim() !== '')), t => t.tanggal)[0];
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

// ── Kehadiran detail page ────────────────────────────────────────

function classifyAttendanceStatus(status: string): AttendanceCategory {
  const s = status.toLowerCase();
  if (s.includes('hadir')) return 'hadir';
  if (s.includes('sakit')) return 'sakit';
  if (s.includes('izin')) return 'izin';
  return 'alpa'; // "alpa" / "tanpa keterangan" / any other unrecognized value
}

/** Distinct months present in a set of dated rows, newest first. */
function getMonthsAvailable<T>(rows: T[], getDate: (row: T) => string): MonthOption[] {
  const map = new Map<string, MonthOption>();
  for (const r of rows) {
    const date = parseFlexibleDate(getDate(r));
    if (!date) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) {
      map.set(key, { key, label: `${BULAN_FULL[date.getMonth()]} ${date.getFullYear()}` });
    }
  }
  return [...map.values()].sort((a, b) => b.key.localeCompare(a.key));
}

/** Picks `requested` if valid, else the current month if it has data, else the latest available month. */
function resolveSelectedMonth(months: MonthOption[], requested: string | undefined, today: Date): string {
  if (requested && months.some(m => m.key === requested)) return requested;
  const currentKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  return months.find(m => m.key === currentKey)?.key ?? months[0]?.key ?? '';
}

export async function getKehadiranDetail(id_santri: string, selectedMonthParam?: string): Promise<KehadiranDetailData> {
  const santri = await googleSheetsService.getSantriById(id_santri);
  const [kehadiran, kelas] = await Promise.all([
    googleSheetsService.getKehadiranBySantri(id_santri),
    santri?.id_kelas ? googleSheetsService.getKelasById(santri.id_kelas) : Promise.resolve(null),
  ]);

  // Rows need a parseable date and a non-empty status to count as a real school day.
  const validRows = kehadiran.filter(r => r.status && parseFlexibleDate(r.tanggal));
  const months = getMonthsAvailable(validRows, r => r.tanggal);
  const selectedMonth = resolveSelectedMonth(months, selectedMonthParam, new Date());
  const monthLabel = months.find(m => m.key === selectedMonth)?.label ?? '-';

  if (!selectedMonth) {
    return {
      studentName: santri?.nama || 'Santri',
      months,
      selectedMonth: '',
      monthLabel: '-',
      summary: { totalHariSekolah: 0, hadirCount: 0, attendancePct: 0, tepatWaktuCount: 0, terlambatCount: 0, rataRataTerlambatMenit: 0, sakitCount: 0, izinCount: 0, alpaCount: 0 },
      calendarDays: [],
      log: [],
    };
  }

  // Master schedule time (per class, applies to every school day) — used to judge punctuality.
  const scheduledMasuk = parseTimeToMinutes(kelas?.jam_masuk);

  const monthRows = validRows
    .filter(r => {
      const d = parseFlexibleDate(r.tanggal)!;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
    })
    .sort((a, b) => (parseFlexibleDate(a.tanggal)!.getTime()) - (parseFlexibleDate(b.tanggal)!.getTime()));

  let hadirCount = 0, tepatWaktuCount = 0, terlambatCount = 0, terlambatTotalMenit = 0;
  let sakitCount = 0, izinCount = 0, alpaCount = 0;

  const log: AttendanceLogRow[] = monthRows.map((r, i) => {
    const date = parseFlexibleDate(r.tanggal)!;
    const kategori = classifyAttendanceStatus(r.status);
    let punctuality: AttendanceLogRow['punctuality'] = null;
    let terlambatMenit: number | null = null;

    if (kategori === 'hadir') {
      hadirCount++;
      const actualMasuk = parseTimeToMinutes(r.jam_masuk);
      if (actualMasuk !== null && scheduledMasuk !== null) {
        if (actualMasuk > scheduledMasuk) {
          punctuality = 'terlambat';
          terlambatMenit = actualMasuk - scheduledMasuk;
          terlambatCount++;
          terlambatTotalMenit += terlambatMenit;
        } else {
          punctuality = 'tepat_waktu';
          terlambatMenit = 0;
          tepatWaktuCount++;
        }
      }
    } else if (kategori === 'sakit') sakitCount++;
    else if (kategori === 'izin') izinCount++;
    else alpaCount++;

    return {
      no: i + 1,
      tanggal: `${date.getDate()} ${BULAN[date.getMonth()]}`,
      hari: HARI_BY_WEEKDAY[date.getDay()],
      status: kategori,
      punctuality,
      terlambatMenit,
      jamMasuk: r.jam_masuk || '-',
      jamPulang: r.jam_pulang || '-',
      catatan: r.catatan || '',
    };
  });

  const totalHariSekolah = monthRows.length;
  const attendancePct = totalHariSekolah > 0 ? Math.round((hadirCount / totalHariSekolah) * 1000) / 10 : 0;
  const rataRataTerlambatMenit = terlambatCount > 0 ? Math.round(terlambatTotalMenit / terlambatCount) : 0;

  // --- Full month calendar grid: every day in the month, 'none' where no Kehadiran row exists ---
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const statusByDay = new Map<number, AttendanceCalendarDay['status']>();
  for (const r of monthRows) {
    const date = parseFlexibleDate(r.tanggal)!;
    const kategori = classifyAttendanceStatus(r.status);
    let status: AttendanceCalendarDay['status'];
    if (kategori === 'hadir') {
      const actualMasuk = parseTimeToMinutes(r.jam_masuk);
      status = (actualMasuk !== null && scheduledMasuk !== null && actualMasuk > scheduledMasuk) ? 'hadir_terlambat' : 'hadir_tepat';
    } else {
      status = kategori;
    }
    statusByDay.set(date.getDate(), status);
  }

  const calendarDays: AttendanceCalendarDay[] = Array.from({ length: daysInMonth }, (_, idx) => {
    const day = idx + 1;
    const weekday = new Date(year, monthIndex, day).getDay();
    return {
      day,
      date: statusByDay.has(day) ? `${year}-${monthStr}-${String(day).padStart(2, '0')}` : null,
      status: statusByDay.get(day) ?? 'none',
      weekday,
    };
  });

  return {
    studentName: santri?.nama || 'Santri',
    months,
    selectedMonth,
    monthLabel,
    summary: { totalHariSekolah, hadirCount, attendancePct, tepatWaktuCount, terlambatCount, rataRataTerlambatMenit, sakitCount, izinCount, alpaCount },
    calendarDays,
    log,
  };
}

// ── Ziyadah detail page ──────────────────────────────────────────

/** "25%" / "43" / "0,8" -> a 0-100 number. Returns 0 for empty/unparseable values. */
function parsePercentString(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.replace('%', '').replace(',', '.').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export async function getZiyadahDetail(id_santri: string, selectedMonthParam?: string): Promise<ZiyadahDetailData> {
  const santri = await googleSheetsService.getSantriById(id_santri);
  const ziyadah = await googleSheetsService.getZiyadahBySantri(id_santri);

  const validRows = ziyadah.filter(r => r.surat && parseFlexibleDate(r.tanggal));
  const months = getMonthsAvailable(validRows, r => r.tanggal);
  const selectedMonth = resolveSelectedMonth(months, selectedMonthParam, new Date());
  const monthLabel = months.find(m => m.key === selectedMonth)?.label ?? '-';

  if (!selectedMonth) {
    return {
      studentName: santri?.nama || 'Santri',
      months,
      selectedMonth: '',
      monthLabel: '-',
      summary: { totalAyatDihafal: 0, totalTargetAyat: 0, pct: 0, surahBaruCount: 0, rataRataAyatPerHari: 0 },
      pencapaian: { lancarAyat: 0, cukupAyat: 0, perluAyat: 0 },
      log: [],
      catatanStrategi: 'Belum ada catatan strategi dari guru.',
      targetPekanDepan: 'Belum ada target untuk pekan depan.',
    };
  }

  const monthRows = validRows
    .filter(r => {
      const d = parseFlexibleDate(r.tanggal)!;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
    })
    .sort((a, b) => parseFlexibleDate(a.tanggal)!.getTime() - parseFlexibleDate(b.tanggal)!.getTime());

  const distinctDates = new Set<string>();

  const log: ZiyadahLogRow[] = monthRows.map((r, i) => {
    const date = parseFlexibleDate(r.tanggal)!;
    const progresPct = parsePercentString(r.progres_ayat);
    const status: ZiyadahStatus = progresPct >= 100 ? 'hafal' : 'proses';
    const pencapaian: ZiyadahPencapaianLevel = progresPct >= 80 ? 'lancar' : progresPct >= 50 ? 'cukup' : 'perlu';

    distinctDates.add(r.tanggal);

    return {
      no: i + 1,
      tanggal: `${date.getDate()} ${BULAN[date.getMonth()]}`,
      hari: HARI_BY_WEEKDAY[date.getDay()],
      surat: r.surat,
      ayatDari: r.ayat_dari,
      ayatSampai: r.ayat_sampai,
      progresPct,
      targetAyat: r.target_ayat,
      status,
      pencapaian,
      catatanGuru: r.catatan_guru || '',
    };
  });

  // Total ayat (and its Lancar/Cukup Lancar/Perlu Diperbaiki split) is derived per
  // distinct surah (grouped by id_surah, falling back to the surah name), not summed
  // across every daily row — a surah worked on across several days must contribute
  // its covered range once, not once per day. The surah's pencapaian level is taken
  // from its most recent entry that month (its current fluency status), not summed.
  interface SurahGroup {
    minAyatDari: number;
    maxAyatSampai: number;
    maxTargetAyat: number;
    latestDateMs: number;
    latestPencapaian: ZiyadahPencapaianLevel;
  }
  const surahGroups = new Map<string, SurahGroup>();
  for (const r of monthRows) {
    const key = (r.id_surah && r.id_surah.trim()) || r.surat.trim().toLowerCase();
    const dateMs = parseFlexibleDate(r.tanggal)!.getTime();
    const progresPct = parsePercentString(r.progres_ayat);
    const pencapaian: ZiyadahPencapaianLevel = progresPct >= 80 ? 'lancar' : progresPct >= 50 ? 'cukup' : 'perlu';

    const g = surahGroups.get(key);
    if (g) {
      g.minAyatDari = Math.min(g.minAyatDari, r.ayat_dari);
      g.maxAyatSampai = Math.max(g.maxAyatSampai, r.ayat_sampai);
      g.maxTargetAyat = Math.max(g.maxTargetAyat, r.target_ayat);
      if (dateMs >= g.latestDateMs) {
        g.latestDateMs = dateMs;
        g.latestPencapaian = pencapaian;
      }
    } else {
      surahGroups.set(key, {
        minAyatDari: r.ayat_dari,
        maxAyatSampai: r.ayat_sampai,
        maxTargetAyat: r.target_ayat,
        latestDateMs: dateMs,
        latestPencapaian: pencapaian,
      });
    }
  }

  let totalAyatDihafal = 0, totalTargetAyat = 0;
  let lancarAyat = 0, cukupAyat = 0, perluAyat = 0;
  for (const g of surahGroups.values()) {
    const verseCount = Math.max(0, g.maxAyatSampai - g.minAyatDari + 1);
    totalAyatDihafal += verseCount;
    totalTargetAyat += g.maxTargetAyat;
    if (g.latestPencapaian === 'lancar') lancarAyat += verseCount;
    else if (g.latestPencapaian === 'cukup') cukupAyat += verseCount;
    else perluAyat += verseCount;
  }
  const surahBaruCount = surahGroups.size;

  const pct = totalTargetAyat > 0 ? Math.round((totalAyatDihafal / totalTargetAyat) * 1000) / 10 : 0;
  const rataRataAyatPerHari = distinctDates.size > 0 ? Math.round((totalAyatDihafal / distinctDates.size) * 10) / 10 : 0;

  const latest = monthRows[monthRows.length - 1];
  const catatanStrategi = latest?.catatan_guru || 'Belum ada catatan strategi dari guru bulan ini.';
  const targetPekanDepan = latest
    ? (parsePercentString(latest.progres_ayat) < 100
        ? `Lanjutkan hafalan ${latest.surat} ayat ${latest.ayat_sampai + 1}-${latest.target_ayat}.`
        : `Lanjutkan ke surah berikutnya setelah ${latest.surat}.`)
    : 'Belum ada target untuk pekan depan.';

  return {
    studentName: santri?.nama || 'Santri',
    months,
    selectedMonth,
    monthLabel,
    summary: { totalAyatDihafal, totalTargetAyat, pct, surahBaruCount, rataRataAyatPerHari },
    pencapaian: { lancarAyat, cukupAyat, perluAyat },
    log,
    catatanStrategi,
    targetPekanDepan,
  };
}

// ── Murojaah detail page ──────────────────────────────────────────

/** "Lancar" / "Cukup Lancar" / "Perlu Diulang" -> normalized level for coloring badges/pie slices. */
function normalizeStatusKelancaran(status: string): MurojaahPencapaianLevel {
  const s = status.toLowerCase();
  if (s.includes('cukup')) return 'cukup';
  if (s.includes('lancar')) return 'lancar';
  return 'perlu';
}

export async function getMurojaahDetail(id_santri: string, selectedMonthParam?: string): Promise<MurojaahDetailData> {
  const santri = await googleSheetsService.getSantriById(id_santri);
  const murojaah = await googleSheetsService.getMurojaahBySantri(id_santri);

  // surat_diulang is often left blank by teachers so far (status_kelancaran is
  // filled in first) — don't require it, only require the status + a parseable date.
  const validRows = murojaah.filter(r => r.status_kelancaran && parseFlexibleDate(r.tanggal));
  const months = getMonthsAvailable(validRows, r => r.tanggal);
  const selectedMonth = resolveSelectedMonth(months, selectedMonthParam, new Date());
  const monthLabel = months.find(m => m.key === selectedMonth)?.label ?? '-';

  if (!selectedMonth) {
    return {
      studentName: santri?.nama || 'Santri',
      months,
      selectedMonth: '',
      monthLabel: '-',
      summary: { totalSesi: 0, pctLancar: 0, surahDiulangCount: 0, rataRataSesiPerHari: 0 },
      pencapaian: { lancarSesi: 0, cukupSesi: 0, perluSesi: 0 },
      log: [],
      catatanStrategi: 'Belum ada catatan strategi dari guru.',
      targetPekanDepan: 'Belum ada target untuk pekan depan.',
    };
  }

  const monthRows = validRows
    .filter(r => {
      const d = parseFlexibleDate(r.tanggal)!;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
    })
    .sort((a, b) => parseFlexibleDate(a.tanggal)!.getTime() - parseFlexibleDate(b.tanggal)!.getTime());

  let lancarSesi = 0, cukupSesi = 0, perluSesi = 0;
  const distinctDates = new Set<string>();
  const distinctSurah = new Set<string>();

  const log: MurojaahLogRow[] = monthRows.map((r, i) => {
    const date = parseFlexibleDate(r.tanggal)!;
    const pencapaian = normalizeStatusKelancaran(r.status_kelancaran);

    distinctDates.add(r.tanggal);
    if (r.surat_diulang) distinctSurah.add(r.surat_diulang);
    if (pencapaian === 'lancar') lancarSesi++;
    else if (pencapaian === 'cukup') cukupSesi++;
    else perluSesi++;

    return {
      no: i + 1,
      tanggal: `${date.getDate()} ${BULAN[date.getMonth()]}`,
      hari: HARI_BY_WEEKDAY[date.getDay()],
      suratDiulang: r.surat_diulang || '-',
      statusKelancaran: r.status_kelancaran,
      pencapaian,
      catatanGuru: r.catatan_guru || '',
    };
  });

  const totalSesi = monthRows.length;
  const pctLancar = totalSesi > 0 ? Math.round((lancarSesi / totalSesi) * 1000) / 10 : 0;
  const rataRataSesiPerHari = distinctDates.size > 0 ? Math.round((totalSesi / distinctDates.size) * 10) / 10 : 0;

  const latest = monthRows[monthRows.length - 1];
  const catatanStrategi = latest?.catatan_guru || 'Belum ada catatan strategi dari guru bulan ini.';
  const targetPekanDepan = latest
    ? (normalizeStatusKelancaran(latest.status_kelancaran) !== 'lancar'
        ? (latest.surat_diulang
            ? `Perkuat kembali murojaah ${latest.surat_diulang} pekan depan.`
            : 'Perkuat kembali materi murojaah pekan depan.')
        : (latest.surat_diulang
            ? `Lanjutkan ke surah berikutnya setelah ${latest.surat_diulang}.`
            : 'Lanjutkan ke materi murojaah berikutnya.'))
    : 'Belum ada target untuk pekan depan.';

  return {
    studentName: santri?.nama || 'Santri',
    months,
    selectedMonth,
    monthLabel,
    summary: { totalSesi, pctLancar, surahDiulangCount: distinctSurah.size, rataRataSesiPerHari },
    pencapaian: { lancarSesi, cukupSesi, perluSesi },
    log,
    catatanStrategi,
    targetPekanDepan,
  };
}
