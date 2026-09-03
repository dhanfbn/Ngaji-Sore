export type ColumnType = 'text' | 'number' | 'select' | 'time' | 'textarea';

export interface ColumnConfig {
  key: string;
  label: string;
  type: ColumnType;
  options?: string[];
  /** For Adab Harian: this column maps to its own natural-key row, not a field on one shared row. */
  kategori?: string;
  width?: string;
  /** On select, also set this row field to the chosen option's `meta` numeric value (e.g. Ziyadah's Surah -> Target Ayat). */
  autofillTargetKey?: string;
  /** Column belongs to a different category's table (e.g. Adab Harian columns embedded in the Kehadiran form) — saved via a separate POST for that category. */
  targetCategory?: 'adab_harian';
}

export interface CategoryConfig {
  key: 'kehadiran' | 'ziyadah' | 'murojaah' | 'tibyan' | 'tarbiyyah' | 'adab_harian' | 'catatan_anak' | 'tugas_rumah';
  label: string;
  columns: ColumnConfig[];
  /** Prefilled for a santri with no existing row yet; saved values from the server always override these. */
  defaultRow?: Record<string, string>;
  /** 'daily' (default): one row per santri per selected hari. 'weekly': one row per santri per selected minggu, no hari breakdown. */
  granularity?: 'daily' | 'weekly';
}

export const CATEGORIES: CategoryConfig[] = [
  {
    key: 'kehadiran',
    label: 'Kehadiran',
    columns: [
      { key: 'status', label: 'Status', type: 'select', options: ['Hadir', 'Sakit', 'Izin', 'Alpa'] },
      { key: 'jam_masuk', label: 'Jam Masuk', type: 'time', width: 'w-24' },
      { key: 'jam_pulang', label: 'Jam Pulang', type: 'time', width: 'w-24' },
      { key: 'catatan', label: 'Catatan', type: 'text' },
      { key: 'Sopan', label: 'Sopan', type: 'number', kategori: 'Sopan', width: 'w-20', targetCategory: 'adab_harian' },
      { key: 'Santun', label: 'Santun', type: 'number', kategori: 'Santun', width: 'w-20', targetCategory: 'adab_harian' },
      { key: 'Kedisiplinan', label: 'Kedisiplinan', type: 'number', kategori: 'Kedisiplinan', width: 'w-24', targetCategory: 'adab_harian' },
    ],
    defaultRow: { jam_masuk: '17:00', jam_pulang: '18:00' },
  },
  {
    key: 'ziyadah',
    label: 'Ziyadah',
    columns: [
      { key: 'id_surah', label: 'Surah', type: 'select', autofillTargetKey: 'target_ayat' }, // options filled dynamically from masterSurah
      { key: 'ayat_dari', label: 'Ayat Dari', type: 'number', width: 'w-20' },
      { key: 'ayat_sampai', label: 'Ayat Sampai', type: 'number', width: 'w-24' },
      { key: 'target_ayat', label: 'Target Ayat', type: 'number', width: 'w-24' },
      { key: 'progres_ayat', label: 'Progres', type: 'text', width: 'w-20' },
      { key: 'catatan_guru', label: 'Catatan', type: 'text' },
    ],
  },
  {
    key: 'murojaah',
    label: 'Murojaah',
    columns: [
      { key: 'surat_diulang', label: 'Surat Diulang', type: 'text' },
      { key: 'status_kelancaran', label: 'Kelancaran', type: 'select', options: ['Lancar', 'Cukup Lancar', 'Perlu Diulang'] },
      { key: 'catatan_guru', label: 'Catatan', type: 'text' },
    ],
  },
  {
    key: 'tibyan',
    label: 'Tibyan',
    columns: [
      { key: 'materi_huruf', label: 'Materi Huruf', type: 'text' },
      { key: 'progres', label: 'Progres', type: 'number', width: 'w-20' },
      { key: 'target', label: 'Target', type: 'number', width: 'w-20' },
      { key: 'catatan_guru', label: 'Catatan', type: 'text' },
    ],
  },
  {
    key: 'tarbiyyah',
    label: 'Tarbiyyah',
    columns: [
      { key: 'tema', label: 'Tema', type: 'text' },
      { key: 'status_capaian', label: 'Status Capaian', type: 'text' },
      { key: 'catatan_guru', label: 'Catatan', type: 'text' },
    ],
  },
  {
    key: 'catatan_anak',
    label: 'Catatan Anak',
    columns: [
      { key: 'isi_catatan', label: 'Catatan', type: 'textarea' },
    ],
  },
  {
    key: 'tugas_rumah',
    label: 'Tugas Rumah',
    granularity: 'weekly',
    columns: [
      { key: 'deskripsi_tugas', label: 'Deskripsi Tugas', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Belum', 'Selesai'] },
    ],
  },
];
