import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { z } from 'zod';

function toUtcDateOnly(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const santri = await prisma.santri.findMany({
    orderBy: { id_santri: 'asc' },
    select: {
      id_santri: true, nama: true, gender: true, tanggal_lahir: true, id_kelas: true,
      ayah_ibu: true, no_hp: true, status_santri: true, periode_belajar: true,
    },
  });

  return NextResponse.json({
    success: true,
    santri: santri.map((s) => ({ ...s, tanggal_lahir: s.tanggal_lahir.toISOString().slice(0, 10) })),
  });
}

const SantriSchema = z.object({
  id_santri: z.string().min(1, 'ID Santri diperlukan'),
  nama: z.string().min(1, 'Nama diperlukan'),
  gender: z.string().optional(),
  tanggal_lahir: z.string().min(1, 'Tanggal lahir diperlukan'),
  id_kelas: z.string().optional(),
  ayah_ibu: z.string().optional(),
  no_hp: z.string().optional(),
  status_santri: z.string().optional(),
  periode_belajar: z.string().optional(),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = SantriSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Data tidak valid' }, { status: 400 });
  }
  const { id_santri, nama, gender, tanggal_lahir, id_kelas, ayah_ibu, no_hp, status_santri, periode_belajar } = parsed.data;

  try {
    const data = {
      nama,
      gender,
      tanggal_lahir: toUtcDateOnly(tanggal_lahir),
      id_kelas: id_kelas || undefined,
      ayah_ibu,
      no_hp,
      status_santri,
      periode_belajar,
    };
    await prisma.santri.upsert({
      where: { id_santri },
      update: data,
      create: { id_santri, ...data },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin santri save error:', error);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan.' }, { status: 500 });
  }
}
