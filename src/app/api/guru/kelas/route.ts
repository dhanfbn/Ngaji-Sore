import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireGuru } from '@/lib/guru-auth';

export async function GET() {
  const guru = await requireGuru();
  if (!guru) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const kelas = await prisma.kelas.findMany({
    where: { id_guru: guru.id },
    orderBy: { nama_kelas: 'asc' },
    select: { id_kelas: true, nama_kelas: true },
  });

  return NextResponse.json({ success: true, kelas });
}
