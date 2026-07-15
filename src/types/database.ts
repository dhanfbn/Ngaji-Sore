import { z } from 'zod';

// Helper to safely parse strings to numbers and default to 0 if NaN/invalid
const safeNumber = z.preprocess((val) => {
  if (typeof val === 'string') {
    // Strip a trailing "%" so percentage-style cells (e.g. "25%") parse cleanly
    const cleaned = val.replace('%', '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  return 0;
}, z.number());

export const SantriSchema = z.object({
  id_santri: z.string(),
  nama: z.string(),
  gender: z.string().optional(),
  tanggal_lahir: z.string(),
  id_kelas: z.string().optional(),
  ayah_ibu: z.string().optional(),
  no_hp: z.string().optional(),
  foto_url: z.string().optional(),
  status_santri: z.string().optional(),
  periode_belajar: z.string().optional(),
  created_at: z.string().optional(),
});

export const KelasSchema = z.object({
  id_kelas: z.string(),
  nama_kelas: z.string().optional(),
  id_guru: z.string().optional(),
  jadwal_kelas: z.string().optional(),
  created_at: z.string().optional(),
});

export const GuruSchema = z.object({
  id_guru: z.string(),
  nama_guru: z.string(),
  no_hp: z.string().optional(),
  foto_url: z.string().optional(),
  status_guru: z.string(),
  created_at: z.string().optional(),
});

// ── v2 taxonomy ──────────────────────────────────────────────────

export const KehadiranSchema = z.object({
  id_kehadiran: z.string(),
  id_santri: z.string(),
  id_kelas: z.string(),
  tanggal: z.string(),
  status: z.string().catch(''),
  catatan: z.string().optional(),
  created_by: z.string().optional(),
  key_minggu: z.string().optional(), // "2026-W01" — ISO week key, added alongside the v2.1 week-filter rollout
});

export const ZiyadahSchema = z.object({
  id_ziyadah: z.string(),
  id_santri: z.string(),
  id_kelas: z.string(),
  surat: z.string(),
  ayat_dari: safeNumber,
  ayat_sampai: safeNumber,
  progres_ayat: z.string().optional(), // stored as a percentage string, e.g. "25%"
  target_ayat: safeNumber,
  tanggal: z.string(),
  catatan_guru: z.string().optional(),
  created_by: z.string().optional(),
  key_minggu: z.string().optional(),
});

export const MurojaahSchema = z.object({
  id_murojaah: z.string(),
  id_santri: z.string(),
  id_kelas: z.string(),
  surat_diulang: z.string(),
  status_kelancaran: z.string(), // Lancar / Cukup Lancar / Perlu Diulang
  tanggal: z.string(),
  catatan_guru: z.string().optional(),
  created_by: z.string().optional(),
  key_minggu: z.string().optional(),
});

export const TibyanSchema = z.object({
  id_tibyan: z.string(),
  id_santri: z.string(),
  id_kelas: z.string(),
  materi_huruf: z.string().optional(),
  progres: safeNumber,
  target: safeNumber,
  tanggal: z.string(),
  catatan_guru: z.string().optional(),
  created_by: z.string().optional(),
  key_minggu: z.string().optional(),
});

export const TarbiyyahSchema = z.object({
  id_tarbiyyah: z.string(),
  id_santri: z.string(),
  id_kelas: z.string(),
  tema: z.string().optional(),
  status_capaian: z.string().optional(),
  tanggal: z.string(),
  catatan_guru: z.string().optional(),
  created_by: z.string().optional(),
  key_minggu: z.string().optional(),
});

export const AdabHarianSchema = z.object({
  id_adab: z.string(),
  id_santri: z.string(),
  id_kelas: z.string(),
  kategori: z.string(),
  nilai: safeNumber,
  catatan_guru: z.string().optional(),
  tanggal: z.string(),
  created_by: z.string().optional(),
  key_minggu: z.string().optional(),
});

export const LessonPlanMingguanSchema = z.object({
  id_lesson_plan: z.string(),
  id_kelas: z.string(),
  key_minggu: z.string(), // "2026-W01" — replaced the old numeric minggu_ke column
  tanggal_mulai: z.string(),
  tanggal_selesai: z.string(),
  tema_minggu: z.string().optional(),
  hari: z.string(),
  kategori: z.string(),
  materi: z.string().optional(),
  created_by: z.string().optional(),
});

export const CatatanAnakSchema = z.object({
  id_catatan: z.string(),
  id_santri: z.string(),
  id_kelas: z.string(),
  id_guru: z.string().optional(),
  tanggal: z.string(),
  isi_catatan: z.string(),
  created_by: z.string().optional(),
  // NOTE: the sheet's actual column header is "minggu_ke" but it holds an ISO
  // week key ("2026-W21"), not a number — kept as-is to match the header text.
  // Consider renaming the sheet column to "key_minggu" for consistency.
  minggu_ke: z.string().optional(),
});

export const TugasRumahSchema = z.object({
  id_tugas: z.string(),
  id_santri: z.string(),
  id_kelas: z.string(),
  deskripsi_tugas: z.string(),
  status: z.string(), // "Belum" / "Selesai" — normalized case-insensitively where used
  tanggal_dibuat: z.string().optional(),
  created_by: z.string().optional(),
  // The old numeric minggu_ke column was replaced (not duplicated) by key_minggu.
  key_minggu: z.string().optional(),
});

export const ProgresMingguanSchema = z.object({
  id_progres: z.string(),
  id_santri: z.string(),
  tanggal: z.string(),
  kehadiran_pct: safeNumber,
  ziyadah_pct: safeNumber,
  murojaah_pct: safeNumber,
  tibyan_pct: safeNumber,
  tarbiyyah_pct: safeNumber,
  adab_pct: safeNumber,
  // The old numeric minggu_ke column was replaced (not duplicated) by key_minggu.
  key_minggu: z.string().optional(),
});

export type SantriRow = z.infer<typeof SantriSchema>;
export type KelasRow = z.infer<typeof KelasSchema>;
export type GuruRow = z.infer<typeof GuruSchema>;
export type KehadiranRow = z.infer<typeof KehadiranSchema>;
export type ZiyadahRow = z.infer<typeof ZiyadahSchema>;
export type MurojaahRow = z.infer<typeof MurojaahSchema>;
export type TibyanRow = z.infer<typeof TibyanSchema>;
export type TarbiyyahRow = z.infer<typeof TarbiyyahSchema>;
export type AdabHarianRow = z.infer<typeof AdabHarianSchema>;
export type LessonPlanMingguanRow = z.infer<typeof LessonPlanMingguanSchema>;
export type CatatanAnakRow = z.infer<typeof CatatanAnakSchema>;
export type TugasRumahRow = z.infer<typeof TugasRumahSchema>;
export type ProgresMingguanRow = z.infer<typeof ProgresMingguanSchema>;
