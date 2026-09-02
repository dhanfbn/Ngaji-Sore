import { prisma } from '@/lib/prisma';
import type {
  SantriRow,
  KelasRow,
  MasterSurahRow,
  KehadiranRow,
  ZiyadahRow,
  MurojaahRow,
  TibyanRow,
  TarbiyyahRow,
  AdabHarianRow,
  LessonPlanMingguanRow,
  CatatanAnakRow,
  TugasRumahRow,
  ProgresMingguanRow,
} from '@/types/database';

// Prisma returns `Date` for @db.Date columns and `null` for optional scalars;
// the existing consumer (dashboard.service.ts) was built against Sheets rows
// where every field is a string (or undefined). These converters keep the
// db.service.ts return shape byte-for-byte compatible with googleSheetsService,
// so dashboard.service.ts needs zero changes beyond the import swap.
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function undef<T>(v: T | null): T | undefined {
  return v === null ? undefined : v;
}

export const googleSheetsService = {
  async getSantriById(id_santri: string): Promise<SantriRow | null> {
    const s = await prisma.santri.findUnique({ where: { id_santri } });
    if (!s) return null;
    return {
      id_santri: s.id_santri,
      nama: s.nama,
      gender: undef(s.gender),
      tanggal_lahir: toDateStr(s.tanggal_lahir),
      id_kelas: undef(s.id_kelas),
      ayah_ibu: undef(s.ayah_ibu),
      no_hp: undef(s.no_hp),
      foto_url: undef(s.foto_url),
      status_santri: undef(s.status_santri),
      periode_belajar: undef(s.periode_belajar),
      created_at: s.created_at ? s.created_at.toISOString() : undefined,
    };
  },

  async getKelasById(id_kelas: string): Promise<KelasRow | null> {
    const k = await prisma.kelas.findUnique({ where: { id_kelas } });
    if (!k) return null;
    return {
      id_kelas: k.id_kelas,
      nama_kelas: undef(k.nama_kelas),
      id_guru: undef(k.id_guru),
      jadwal_kelas: undef(k.jadwal_kelas),
      jam_masuk: undef(k.jam_masuk),
      jam_pulang: undef(k.jam_pulang),
      created_at: k.created_at ? k.created_at.toISOString() : undefined,
    };
  },

  async getMasterSurah(): Promise<MasterSurahRow[]> {
    const rows = await prisma.masterSurah.findMany();
    return rows.map((r) => ({
      id_surah: r.id_surah,
      nama_surah: r.nama_surah,
      jumlah_ayat: r.jumlah_ayat,
    }));
  },

  async getSurahById(id_surah: string): Promise<MasterSurahRow | null> {
    const r = await prisma.masterSurah.findUnique({ where: { id_surah } });
    if (!r) return null;
    return { id_surah: r.id_surah, nama_surah: r.nama_surah, jumlah_ayat: r.jumlah_ayat };
  },

  async getKehadiranBySantri(id_santri: string): Promise<KehadiranRow[]> {
    const rows = await prisma.kehadiran.findMany({ where: { id_santri } });
    return rows.map((r) => ({
      id_kehadiran: r.id_kehadiran,
      id_santri: r.id_santri,
      id_kelas: r.id_kelas,
      tanggal: toDateStr(r.tanggal),
      status: r.status,
      catatan: undef(r.catatan),
      created_by: undef(r.created_by),
      key_minggu: undef(r.key_minggu),
      jam_masuk: undef(r.jam_masuk),
      jam_pulang: undef(r.jam_pulang),
    }));
  },

  async getZiyadahBySantri(id_santri: string): Promise<ZiyadahRow[]> {
    const rows = await prisma.ziyadah.findMany({ where: { id_santri } });
    return rows.map((r) => ({
      id_ziyadah: r.id_ziyadah,
      id_santri: r.id_santri,
      id_kelas: r.id_kelas,
      surat: r.surat,
      id_surah: undef(r.id_surah),
      ayat_dari: r.ayat_dari,
      ayat_sampai: r.ayat_sampai,
      progres_ayat: undef(r.progres_ayat),
      target_ayat: r.target_ayat,
      tanggal: toDateStr(r.tanggal),
      catatan_guru: undef(r.catatan_guru),
      created_by: undef(r.created_by),
      key_minggu: undef(r.key_minggu),
    }));
  },

  async getMurojaahBySantri(id_santri: string): Promise<MurojaahRow[]> {
    const rows = await prisma.murojaah.findMany({ where: { id_santri } });
    return rows.map((r) => ({
      id_murojaah: r.id_murojaah,
      id_santri: r.id_santri,
      id_kelas: r.id_kelas,
      surat_diulang: r.surat_diulang,
      status_kelancaran: r.status_kelancaran,
      tanggal: toDateStr(r.tanggal),
      catatan_guru: undef(r.catatan_guru),
      created_by: undef(r.created_by),
      key_minggu: undef(r.key_minggu),
    }));
  },

  async getTibyanBySantri(id_santri: string): Promise<TibyanRow[]> {
    const rows = await prisma.tibyan.findMany({ where: { id_santri } });
    return rows.map((r) => ({
      id_tibyan: r.id_tibyan,
      id_santri: r.id_santri,
      id_kelas: r.id_kelas,
      materi_huruf: undef(r.materi_huruf),
      progres: r.progres,
      target: r.target,
      tanggal: toDateStr(r.tanggal),
      catatan_guru: undef(r.catatan_guru),
      created_by: undef(r.created_by),
      key_minggu: undef(r.key_minggu),
    }));
  },

  async getTarbiyyahBySantri(id_santri: string): Promise<TarbiyyahRow[]> {
    const rows = await prisma.tarbiyyah.findMany({ where: { id_santri } });
    return rows.map((r) => ({
      id_tarbiyyah: r.id_tarbiyyah,
      id_santri: r.id_santri,
      id_kelas: r.id_kelas,
      tema: undef(r.tema),
      status_capaian: undef(r.status_capaian),
      tanggal: toDateStr(r.tanggal),
      catatan_guru: undef(r.catatan_guru),
      created_by: undef(r.created_by),
      key_minggu: undef(r.key_minggu),
    }));
  },

  async getAdabHarianBySantri(id_santri: string): Promise<AdabHarianRow[]> {
    const rows = await prisma.adabHarian.findMany({ where: { id_santri } });
    return rows.map((r) => ({
      id_adab: r.id_adab,
      id_santri: r.id_santri,
      id_kelas: r.id_kelas,
      kategori: r.kategori,
      nilai: r.nilai,
      catatan_guru: undef(r.catatan_guru),
      tanggal: toDateStr(r.tanggal),
      created_by: undef(r.created_by),
      key_minggu: undef(r.key_minggu),
    }));
  },

  async getLessonPlanByKelas(id_kelas: string): Promise<LessonPlanMingguanRow[]> {
    const rows = await prisma.lessonPlanMingguan.findMany({ where: { id_kelas } });
    return rows.map((r) => ({
      id_lesson_plan: r.id_lesson_plan ?? '',
      id_kelas: r.id_kelas,
      key_minggu: r.key_minggu,
      tanggal_mulai: toDateStr(r.tanggal_mulai),
      tanggal_selesai: toDateStr(r.tanggal_selesai),
      tema_minggu: undef(r.tema_minggu),
      hari: r.hari,
      kategori: r.kategori,
      materi: undef(r.materi),
      created_by: undef(r.created_by),
    }));
  },

  async getCatatanAnakBySantri(id_santri: string): Promise<CatatanAnakRow[]> {
    const rows = await prisma.catatanAnak.findMany({ where: { id_santri } });
    return rows.map((r) => ({
      id_catatan: r.id_catatan,
      id_santri: r.id_santri,
      id_kelas: r.id_kelas,
      id_guru: r.id_guru ?? '',
      tanggal: toDateStr(r.tanggal),
      isi_catatan: r.isi_catatan,
      created_by: undef(r.created_by),
      minggu_ke: undef(r.minggu_ke),
    }));
  },

  async getTugasRumahBySantri(id_santri: string): Promise<TugasRumahRow[]> {
    const rows = await prisma.tugasRumah.findMany({ where: { id_santri } });
    return rows.map((r) => ({
      id_tugas: r.id_tugas,
      id_santri: r.id_santri,
      id_kelas: r.id_kelas,
      deskripsi_tugas: r.deskripsi_tugas,
      status: r.status,
      tanggal_dibuat: r.tanggal_dibuat ? toDateStr(r.tanggal_dibuat) : undefined,
      created_by: undef(r.created_by),
      key_minggu: undef(r.key_minggu),
    }));
  },

  async getProgresMingguanBySantri(id_santri: string): Promise<ProgresMingguanRow[]> {
    const rows = await prisma.progresMingguan.findMany({ where: { id_santri } });
    return rows.map((r) => ({
      id_progres: r.id_progres,
      id_santri: r.id_santri,
      tanggal: toDateStr(r.tanggal),
      kehadiran_pct: r.kehadiran_pct,
      ziyadah_pct: r.ziyadah_pct,
      murojaah_pct: r.murojaah_pct,
      tibyan_pct: r.tibyan_pct,
      tarbiyyah_pct: r.tarbiyyah_pct,
      adab_pct: r.adab_pct,
      key_minggu: undef(r.key_minggu),
    }));
  },
};
