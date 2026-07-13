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
