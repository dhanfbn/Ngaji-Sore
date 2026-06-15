import { z } from 'zod';

// Helper to safely parse strings to numbers and default to 0 if NaN/invalid
const safeNumber = z.preprocess((val) => {
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
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

export const KehadiranSchema = z.object({
  id_kehadiran: z.string(),
  id_santri: z.string(),
  id_kelas: z.string(),
  tanggal_kehadiran: z.string(),
  status_kehadiran: z.enum(['Hadir', 'Izin', 'Alpha', '']).catch(''),
});

export const TilawahSchema = z.object({
  id_tilawah: z.string(),
  id_santri: z.string(),
  jenis_tilawah: z.string(), // IQRO or ALQURAN
  materi_tilawah: z.string(),
  progress_tilawah: safeNumber,
  target_tilawah: safeNumber,
  tanggal_tilawah: z.string(),
  catatan_guru: z.string().optional(),
  created_at: z.string().optional(),
});

export const TahfizSchema = z.object({
  id_tahfizh: z.string(),
  id_santri: z.string(),
  surat: z.string(),
  ayat_selesai: safeNumber,
  target_ayat: safeNumber,
  tanggal_tahfizh: z.string(),
  catatan_guru: z.string().optional(),
});

export const DoaSchema = z.object({
  id_doa: z.string(),
  id_santri: z.string(),
  nama_doa: z.string(),
  status: z.string(),
});

export const AdabSchema = z.object({
  id_adab: z.string(),
  id_santri: z.string(),
  kategori: z.string(),
  nilai: safeNumber,
  catatan_guru: z.string().optional(),
  tanggal_adab: z.string(),
});

export const CatatanGuruSchema = z.object({
  id_catatan_guru: z.string(),
  id_santri: z.string(),
  id_guru: z.string(),
  tanggal_catatan: z.string(),
  catatan: z.string(),
});

export const TargetPencapaianSchema = z.object({
  id_santri: z.string(),
  kategori: z.string(),
  target: z.string(),
  deadline: z.string(),
});

export type SantriRow = z.infer<typeof SantriSchema>;
export type KehadiranRow = z.infer<typeof KehadiranSchema>;
export type TilawahRow = z.infer<typeof TilawahSchema>;
export type TahfizRow = z.infer<typeof TahfizSchema>;
export type DoaRow = z.infer<typeof DoaSchema>;
export type AdabRow = z.infer<typeof AdabSchema>;
export type CatatanGuruRow = z.infer<typeof CatatanGuruSchema>;
export type TargetPencapaianRow = z.infer<typeof TargetPencapaianSchema>;
