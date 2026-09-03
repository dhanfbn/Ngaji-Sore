import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { hashPassword } from '@/lib/password';
import { z } from 'zod';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const guru = await prisma.guru.findMany({
    orderBy: { id_guru: 'asc' },
    select: { id_guru: true, nama_guru: true, no_hp: true, status_guru: true },
  });

  return NextResponse.json({ success: true, guru });
}

const GuruSchema = z.object({
  id_guru: z.string().min(1, 'ID Guru diperlukan'),
  nama_guru: z.string().min(1, 'Nama diperlukan'),
  no_hp: z.string().optional(),
  status_guru: z.string().min(1, 'Status diperlukan'),
  password: z.string().optional(),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = GuruSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Data tidak valid' }, { status: 400 });
  }
  const { id_guru, nama_guru, no_hp, status_guru, password } = parsed.data;

  try {
    const existing = await prisma.guru.findUnique({ where: { id_guru } });

    if (!existing && !password) {
      return NextResponse.json({ success: false, message: 'Password wajib diisi untuk guru baru.' }, { status: 400 });
    }

    const password_hash = password ? await hashPassword(password) : undefined;

    if (existing) {
      await prisma.guru.update({
        where: { id_guru },
        data: { nama_guru, no_hp, status_guru, ...(password_hash && { password_hash }) },
      });
    } else {
      await prisma.guru.create({
        data: { id_guru, nama_guru, no_hp, status_guru, password_hash: password_hash! },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin guru save error:', error);
    return NextResponse.json({ success: false, message: 'Gagal menyimpan.' }, { status: 500 });
  }
}
