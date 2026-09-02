import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireGuru } from '@/lib/guru-auth';
import { getWeeksForKelas } from '@/lib/weeks';
import { parseFlexibleDate } from '@/lib/date';

/** parseFlexibleDate() builds a Date from LOCAL Y/M/D components — .toISOString()
 * would shift the calendar date back a day in positive-UTC-offset timezones, so
 * format the local components directly instead (same fix as scripts/migrate-to-postgres.ts). */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function GET(request: Request) {
  const guru = await requireGuru();
  if (!guru) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id_kelas = searchParams.get('id_kelas');
  if (!id_kelas) {
    return NextResponse.json({ success: false, message: 'id_kelas diperlukan' }, { status: 400 });
  }

  const owns = await prisma.kelas.findFirst({ where: { id_kelas, id_guru: guru.id } });
  if (!owns) {
    return NextResponse.json({ success: false, message: 'Kelas tidak ditemukan.' }, { status: 403 });
  }

  const { weeks, lessonPlans } = await getWeeksForKelas(id_kelas);

  const firstRowPerWeek = new Map<string, string>();
  for (const p of lessonPlans) {
    if (!firstRowPerWeek.has(p.key_minggu)) firstRowPerWeek.set(p.key_minggu, p.tanggal_mulai);
  }

  const weeksWithStart = weeks.map((w) => {
    const raw = firstRowPerWeek.get(w.key);
    const start = raw ? parseFlexibleDate(raw) : null;
    return { ...w, tanggal_mulai: start ? toLocalDateStr(start) : null };
  });

  return NextResponse.json({ success: true, weeks: weeksWithStart });
}
