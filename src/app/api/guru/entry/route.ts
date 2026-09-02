import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { requireGuru } from '@/lib/guru-auth';
import { z } from 'zod';

const CATEGORIES = ['kehadiran', 'ziyadah', 'murojaah', 'tibyan', 'tarbiyyah', 'adab_harian'] as const;
type Category = (typeof CATEGORIES)[number];

function toUtcDateOnly(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
}
function forbidden() {
  return NextResponse.json({ success: false, message: 'Kelas tidak ditemukan.' }, { status: 403 });
}

// --- GET: roster + existing entries for a category/kelas/tanggal ---

export async function GET(request: Request) {
  const guru = await requireGuru();
  if (!guru) return unauthorized();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as Category | null;
  const id_kelas = searchParams.get('id_kelas');
  const tanggalStr = searchParams.get('tanggal');

  if (!category || !CATEGORIES.includes(category) || !id_kelas || !tanggalStr) {
    return NextResponse.json({ success: false, message: 'category, id_kelas, tanggal diperlukan' }, { status: 400 });
  }

  const owns = await prisma.kelas.findFirst({ where: { id_kelas, id_guru: guru.id } });
  if (!owns) return forbidden();

  const tanggal = toUtcDateOnly(tanggalStr);
  const santri = await prisma.santri.findMany({
    where: { id_kelas },
    orderBy: { nama: 'asc' },
    select: { id_santri: true, nama: true },
  });
  const ids = santri.map((s) => s.id_santri);

  const entries: Record<string, Record<string, unknown>> = {};
  let masterSurah: { id_surah: string; nama_surah: string; jumlah_ayat: number }[] | undefined;

  switch (category) {
    case 'kehadiran': {
      const rows = await prisma.kehadiran.findMany({ where: { id_santri: { in: ids }, tanggal } });
      for (const r of rows) {
        entries[r.id_santri] = { status: r.status, catatan: r.catatan ?? '', jam_masuk: r.jam_masuk ?? '', jam_pulang: r.jam_pulang ?? '' };
      }
      break;
    }
    case 'ziyadah': {
      const rows = await prisma.ziyadah.findMany({ where: { id_santri: { in: ids }, tanggal } });
      for (const r of rows) {
        entries[r.id_santri] = {
          id_surah: r.id_surah ?? '',
          ayat_dari: r.ayat_dari,
          ayat_sampai: r.ayat_sampai,
          target_ayat: r.target_ayat,
          progres_ayat: r.progres_ayat ?? '',
          catatan_guru: r.catatan_guru ?? '',
        };
      }
      // id_surah is a String column ("1".."114") — Postgres would string-sort it
      // ("1","10","11",...,"2"), so sort numerically in JS instead.
      const surahs = await prisma.masterSurah.findMany({ select: { id_surah: true, nama_surah: true, jumlah_ayat: true } });
      masterSurah = surahs.sort((a, b) => Number(a.id_surah) - Number(b.id_surah));
      break;
    }
    case 'murojaah': {
      const rows = await prisma.murojaah.findMany({ where: { id_santri: { in: ids }, tanggal } });
      for (const r of rows) {
        entries[r.id_santri] = { surat_diulang: r.surat_diulang, status_kelancaran: r.status_kelancaran, catatan_guru: r.catatan_guru ?? '' };
      }
      break;
    }
    case 'tibyan': {
      const rows = await prisma.tibyan.findMany({ where: { id_santri: { in: ids }, tanggal } });
      for (const r of rows) {
        entries[r.id_santri] = { materi_huruf: r.materi_huruf ?? '', progres: r.progres, target: r.target, catatan_guru: r.catatan_guru ?? '' };
      }
      break;
    }
    case 'tarbiyyah': {
      const rows = await prisma.tarbiyyah.findMany({ where: { id_santri: { in: ids }, tanggal } });
      for (const r of rows) {
        entries[r.id_santri] = { tema: r.tema ?? '', status_capaian: r.status_capaian ?? '', catatan_guru: r.catatan_guru ?? '' };
      }
      break;
    }
    case 'adab_harian': {
      const rows = await prisma.adabHarian.findMany({ where: { id_santri: { in: ids }, tanggal } });
      for (const r of rows) {
        entries[r.id_santri] = entries[r.id_santri] ?? {};
        (entries[r.id_santri] as Record<string, number>)[r.kategori] = r.nilai;
      }
      break;
    }
  }

  return NextResponse.json({ success: true, santri, entries, masterSurah });
}

// --- POST: find-or-create upsert for one santri's row ---

const KehadiranData = z.object({
  status: z.string().optional(),
  catatan: z.string().optional(),
  jam_masuk: z.string().optional(),
  jam_pulang: z.string().optional(),
});
const ZiyadahData = z.object({
  id_surah: z.string().optional(),
  ayat_dari: z.coerce.number().optional(),
  ayat_sampai: z.coerce.number().optional(),
  target_ayat: z.coerce.number().optional(),
  progres_ayat: z.string().optional(),
  catatan_guru: z.string().optional(),
});
const MurojaahData = z.object({
  surat_diulang: z.string().optional(),
  status_kelancaran: z.string().optional(),
  catatan_guru: z.string().optional(),
});
const TibyanData = z.object({
  materi_huruf: z.string().optional(),
  progres: z.coerce.number().optional(),
  target: z.coerce.number().optional(),
  catatan_guru: z.string().optional(),
});
const TarbiyyahData = z.object({
  tema: z.string().optional(),
  status_capaian: z.string().optional(),
  catatan_guru: z.string().optional(),
});
const AdabData = z.object({
  Sopan: z.coerce.number().optional(),
  Santun: z.coerce.number().optional(),
  Kedisiplinan: z.coerce.number().optional(),
});

const BodySchema = z.object({
  category: z.enum(CATEGORIES),
  id_santri: z.string().min(1),
  id_kelas: z.string().min(1),
  tanggal: z.string().min(1),
  key_minggu: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  const guru = await requireGuru();
  if (!guru) return unauthorized();

  const json = await request.json();
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 });
  }
  const { category, id_santri, id_kelas, tanggal: tanggalStr, key_minggu, data } = parsed.data;

  const owns = await prisma.kelas.findFirst({ where: { id_kelas, id_guru: guru.id } });
  if (!owns) return forbidden();

  const tanggal = toUtcDateOnly(tanggalStr);

  try {
    switch (category) {
      case 'kehadiran': {
        const d = KehadiranData.parse(data);
        const existing = await prisma.kehadiran.findFirst({ where: { id_santri, tanggal } });
        if (existing) {
          await prisma.kehadiran.update({ where: { id_kehadiran: existing.id_kehadiran }, data: { ...d, id_kelas } });
        } else {
          await prisma.kehadiran.create({
            data: {
              id_kehadiran: randomUUID(),
              id_santri, id_kelas, tanggal,
              status: d.status ?? '',
              catatan: d.catatan, jam_masuk: d.jam_masuk, jam_pulang: d.jam_pulang,
              key_minggu, created_by: guru.id,
            },
          });
        }
        break;
      }
      case 'ziyadah': {
        const d = ZiyadahData.parse(data);
        let surat: string | undefined;
        if (d.id_surah) {
          const surah = await prisma.masterSurah.findUnique({ where: { id_surah: d.id_surah } });
          surat = surah?.nama_surah;
        }
        const existing = await prisma.ziyadah.findFirst({ where: { id_santri, tanggal } });
        if (existing) {
          await prisma.ziyadah.update({
            where: { id_ziyadah: existing.id_ziyadah },
            data: { ...d, surat: surat ?? existing.surat, id_kelas },
          });
        } else {
          await prisma.ziyadah.create({
            data: {
              id_ziyadah: randomUUID(),
              id_santri, id_kelas, tanggal,
              surat: surat ?? '',
              id_surah: d.id_surah,
              ayat_dari: d.ayat_dari ?? 0,
              ayat_sampai: d.ayat_sampai ?? 0,
              target_ayat: d.target_ayat ?? 0,
              progres_ayat: d.progres_ayat,
              catatan_guru: d.catatan_guru,
              key_minggu, created_by: guru.id,
            },
          });
        }
        break;
      }
      case 'murojaah': {
        const d = MurojaahData.parse(data);
        const existing = await prisma.murojaah.findFirst({ where: { id_santri, tanggal } });
        if (existing) {
          await prisma.murojaah.update({ where: { id_murojaah: existing.id_murojaah }, data: { ...d, id_kelas } });
        } else {
          await prisma.murojaah.create({
            data: {
              id_murojaah: randomUUID(),
              id_santri, id_kelas, tanggal,
              surat_diulang: d.surat_diulang ?? '',
              status_kelancaran: d.status_kelancaran ?? '',
              catatan_guru: d.catatan_guru,
              key_minggu, created_by: guru.id,
            },
          });
        }
        break;
      }
      case 'tibyan': {
        const d = TibyanData.parse(data);
        const existing = await prisma.tibyan.findFirst({ where: { id_santri, tanggal } });
        if (existing) {
          await prisma.tibyan.update({ where: { id_tibyan: existing.id_tibyan }, data: { ...d, id_kelas } });
        } else {
          await prisma.tibyan.create({
            data: {
              id_tibyan: randomUUID(),
              id_santri, id_kelas, tanggal,
              materi_huruf: d.materi_huruf,
              progres: d.progres ?? 0,
              target: d.target ?? 0,
              catatan_guru: d.catatan_guru,
              key_minggu, created_by: guru.id,
            },
          });
        }
        break;
      }
      case 'tarbiyyah': {
        const d = TarbiyyahData.parse(data);
        const existing = await prisma.tarbiyyah.findFirst({ where: { id_santri, tanggal } });
        if (existing) {
          await prisma.tarbiyyah.update({ where: { id_tarbiyyah: existing.id_tarbiyyah }, data: { ...d, id_kelas } });
        } else {
          await prisma.tarbiyyah.create({
            data: {
              id_tarbiyyah: randomUUID(),
              id_santri, id_kelas, tanggal,
              tema: d.tema,
              status_capaian: d.status_capaian,
              catatan_guru: d.catatan_guru,
              key_minggu, created_by: guru.id,
            },
          });
        }
        break;
      }
      case 'adab_harian': {
        const d = AdabData.parse(data);
        const kategoriEntries: [string, number | undefined][] = [
          ['Sopan', d.Sopan], ['Santun', d.Santun], ['Kedisiplinan', d.Kedisiplinan],
        ];
        for (const [kategori, nilai] of kategoriEntries) {
          if (nilai === undefined) continue;
          const existing = await prisma.adabHarian.findFirst({ where: { id_santri, tanggal, kategori } });
          if (existing) {
            await prisma.adabHarian.update({ where: { id_adab: existing.id_adab }, data: { nilai, id_kelas } });
          } else {
            await prisma.adabHarian.create({
              data: {
                id_adab: randomUUID(),
                id_santri, id_kelas, tanggal, kategori, nilai,
                key_minggu, created_by: guru.id,
              },
            });
          }
        }
        break;
      }
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Data tidak valid' }, { status: 400 });
    }
    console.error('Guru entry save error:', e);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
