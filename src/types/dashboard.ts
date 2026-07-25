export interface KPIEntry {
  key: string;
  label: string;
  value: number;
  unit: '%';
  detail: string;
  badge: string;
  locked: boolean;
}

export interface ChartDataPoint {
  week: string;
  kehadiran: number;
  ziyadah: number;
  murojaah: number;
  tibyan: number;
  tarbiyyah: number;
  adab: number;
}

export interface LessonPlanDay {
  hari: string;
  kategori: string;
  materi: string;
}

export interface LessonPlanData {
  tema?: string;
  hari: LessonPlanDay[];
}

export interface HomeworkItem {
  deskripsi: string;
  status: 'belum' | 'selesai';
}

export interface WeekOption {
  /** e.g. "2026-W29" */
  key: string;
  /** e.g. "13 – 17 Jul 2026" */
  label: string;
}

// ── Kehadiran detail page ────────────────────────────────────────

export interface MonthOption {
  /** e.g. "2026-04" */
  key: string;
  /** e.g. "April 2026" */
  label: string;
}

export type AttendanceCategory = 'hadir' | 'sakit' | 'izin' | 'alpa';
export type PunctualityStatus = 'tepat_waktu' | 'terlambat' | null;

export interface AttendanceCalendarDay {
  day: number;
  /** raw sheet date string for this day, only set when a Kehadiran row exists */
  date: string | null;
  status: 'hadir_tepat' | 'hadir_terlambat' | 'sakit' | 'izin' | 'alpa' | 'none';
  /** 0-6, Sun-Sat (Date.getDay()) */
  weekday: number;
}

export interface AttendanceLogRow {
  no: number;
  tanggal: string;
  hari: string;
  status: AttendanceCategory;
  punctuality: PunctualityStatus;
  terlambatMenit: number | null;
  jamMasuk: string;
  jamPulang: string;
  catatan: string;
}

export interface AttendanceSummary {
  totalHariSekolah: number;
  hadirCount: number;
  attendancePct: number;
  tepatWaktuCount: number;
  terlambatCount: number;
  rataRataTerlambatMenit: number;
  sakitCount: number;
  izinCount: number;
  alpaCount: number;
}

export interface KehadiranDetailData {
  studentName: string;
  months: MonthOption[];
  selectedMonth: string;
  monthLabel: string;
  summary: AttendanceSummary;
  calendarDays: AttendanceCalendarDay[];
  log: AttendanceLogRow[];
}

// ── Ziyadah detail page ──────────────────────────────────────────

export type ZiyadahStatus = 'hafal' | 'proses';
/** Progress-based proxy, NOT a teacher-judged fluency rating — see progresPct. */
export type ZiyadahPencapaianLevel = 'lancar' | 'cukup' | 'perlu';

export interface ZiyadahLogRow {
  no: number;
  tanggal: string;
  hari: string;
  surat: string;
  ayatDari: number;
  ayatSampai: number;
  progresPct: number;
  targetAyat: number;
  status: ZiyadahStatus;
  pencapaian: ZiyadahPencapaianLevel;
  catatanGuru: string;
}

export interface ZiyadahSummary {
  totalAyatDihafal: number;
  totalTargetAyat: number;
  pct: number;
  surahBaruCount: number;
  rataRataAyatPerHari: number;
}

export interface ZiyadahPencapaian {
  lancarAyat: number;
  cukupAyat: number;
  perluAyat: number;
}

export interface ZiyadahDetailData {
  studentName: string;
  months: MonthOption[];
  selectedMonth: string;
  monthLabel: string;
  summary: ZiyadahSummary;
  pencapaian: ZiyadahPencapaian;
  log: ZiyadahLogRow[];
  catatanStrategi: string;
  targetPekanDepan: string;
}
