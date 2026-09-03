import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { z } from 'zod';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const kelas = await prisma.kelas.findMany({
    orderBy: { id_kelas: 'asc' },
    select: { id_kelas: true, nama_kelas: true, id_guru: true, jadwal_kelas: true, jam_masuk: true, jam_pulang: true },
  });

  return NextResponse.json({ success: true, kelas });
}

const KelasSchema = z.object({
  id_kelas: z.string().min(1, 'ID Kelas diperlukan'),
  nama_kelas: z.string().optional(),
  id_guru: z.string().optional(),
  jadwal_kelas: z.string().optional(),
  jam_masuk: z.string().optional(),
  jam_pulang: z.string().optional(),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = KelasSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Data tidak valid' }, { status: 400 });
  }
  const { id_kelas, nama_kelas, id_guru, jadwal_kelas, jam_masuk, jam_pulang } = parsed.data;

  try {
    const data = {
      nama_kelas,
      id_guru: id_guru || undefined,
      jadwal_kelas,
      jam_masuk,
      jam_pulang,
    };
    await prisma.kelas.upsert({
      where: { id_kelas },
      update: data,
      create: { id_kelas, ...data },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin kelas save error:', error);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan.' }, { status: 500 });
  }
}
