import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { z } from 'zod';

function toUtcDateOnly(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id_kelas = searchParams.get('id_kelas');
  const key_minggu = searchParams.get('key_minggu');
  if (!id_kelas || !key_minggu) {
    return NextResponse.json({ success: false, message: 'id_kelas dan key_minggu diperlukan' }, { status: 400 });
  }

  const rows = await prisma.lessonPlanMingguan.findMany({
    where: { id_kelas, key_minggu },
    orderBy: { id: 'asc' },
  });

  return NextResponse.json({
    success: true,
    rows: rows.map((r) => ({
      id: r.id,
      hari: r.hari,
      kategori: r.kategori,
      materi: r.materi ?? '',
      tema_minggu: r.tema_minggu ?? '',
      tanggal_mulai: r.tanggal_mulai.toISOString().slice(0, 10),
      tanggal_selesai: r.tanggal_selesai.toISOString().slice(0, 10),
    })),
  });
}

const RowSchema = z.object({
  id: z.number().optional(),
  hari: z.string().min(1),
  kategori: z.string().min(1),
  materi: z.string().optional(),
});

const BodySchema = z.object({
  id_kelas: z.string().min(1, 'Kelas diperlukan'),
  key_minggu: z.string().min(1, 'Minggu diperlukan'),
  tanggal_mulai: z.string().min(1, 'Tanggal mulai diperlukan'),
  tanggal_selesai: z.string().min(1, 'Tanggal selesai diperlukan'),
  tema_minggu: z.string().optional(),
  rows: z.array(RowSchema).min(1, 'Minimal 1 baris'),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Data tidak valid' }, { status: 400 });
  }
  const { id_kelas, key_minggu, tanggal_mulai, tanggal_selesai, tema_minggu, rows } = parsed.data;

  try {
    const shared = {
      id_kelas,
      key_minggu,
      tanggal_mulai: toUtcDateOnly(tanggal_mulai),
      tanggal_selesai: toUtcDateOnly(tanggal_selesai),
      tema_minggu,
      created_by: admin.id,
    };

    for (const row of rows) {
      if (row.id) {
        await prisma.lessonPlanMingguan.update({
          where: { id: row.id },
          data: { ...shared, hari: row.hari, kategori: row.kategori, materi: row.materi },
        });
      } else {
        await prisma.lessonPlanMingguan.create({
          data: { ...shared, hari: row.hari, kategori: row.kategori, materi: row.materi },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin lesson-plan save error:', error);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan.' }, { status: 500 });
  }
}
