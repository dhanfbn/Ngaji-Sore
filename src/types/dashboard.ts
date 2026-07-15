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
