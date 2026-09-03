import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { requireGuru } from '@/lib/guru-auth';

// Per product decision: status_kelancaran (Murojaah) has no numeric field to
// average, so it's mapped to a fixed scale mirroring the KPI badge thresholds.
const MUROJAAH_PCT: Record<string, number> = {
  'Lancar': 100,
  'Cukup Lancar': 80,
  'Perlu Diulang': 50,
};

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

/** Prisma @db.Date columns are stored UTC-midnight-anchored (see scripts/migrate-to-postgres.ts's
 * toUtcDate()), so the calendar weekday reads correctly via getUTCDay(), not getDay(). */
function isWeekday(d: Date): boolean {
  const day = d.getUTCDay();
  return day >= 1 && day <= 5;
}

export async function POST(request: Request) {
  const guru = await requireGuru();
  if (!guru) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const id_kelas: string | undefined = body.id_kelas;
  const key_minggu: string | undefined = body.key_minggu;
  const mode: 'selected' | 'all' = body.mode === 'all' ? 'all' : 'selected';
  if (!id_kelas || (mode === 'selected' && !key_minggu)) {
    return NextResponse.json({ success: false, message: 'id_kelas dan key_minggu diperlukan' }, { status: 400 });
  }

  const kelas = await prisma.kelas.findFirst({ where: { id_kelas, id_guru: guru.id } });
  if (!kelas) {
    return NextResponse.json({ success: false, message: 'Kelas tidak ditemukan.' }, { status: 403 });
  }

  const weekKeys =
    mode === 'all'
      ? (
          await prisma.lessonPlanMingguan.findMany({
            where: { id_kelas },
            distinct: ['key_minggu'],
            select: { key_minggu: true },
          })
        ).map((w) => w.key_minggu)
      : [key_minggu!];

  const santriList = await prisma.santri.findMany({ where: { id_kelas }, select: { id_santri: true } });

  let updated = 0;
  for (const wk of weekKeys) {
    const lessonPlan = await prisma.lessonPlanMingguan.findFirst({ where: { id_kelas, key_minggu: wk } });
    const weekStart = lessonPlan?.tanggal_mulai ?? new Date();

    for (const { id_santri } of santriList) {
      const [kehadiran, ziyadah, murojaah, tibyan, tarbiyyah, adab] = await Promise.all([
        prisma.kehadiran.findMany({ where: { id_santri, key_minggu: wk } }),
        prisma.ziyadah.findMany({ where: { id_santri, key_minggu: wk } }),
        prisma.murojaah.findMany({ where: { id_santri, key_minggu: wk } }),
        prisma.tibyan.findMany({ where: { id_santri, key_minggu: wk } }),
        prisma.tarbiyyah.findMany({ where: { id_santri, key_minggu: wk } }),
        prisma.adabHarian.findMany({ where: { id_santri, key_minggu: wk } }),
      ]);

      const weekdayKehadiran = kehadiran.filter((k) => isWeekday(k.tanggal));
      const kehadiran_pct =
        weekdayKehadiran.length > 0
          ? Math.round(
              (weekdayKehadiran.filter((k) => k.status.toLowerCase() === 'hadir').length / weekdayKehadiran.length) * 1000
            ) / 10
          : 0;

      const ziyadah_pct = avg(
        ziyadah
          .map((z) => parseFloat((z.progres_ayat ?? '').replace('%', '')))
          .filter((n) => !Number.isNaN(n))
      );

      const murojaah_pct = avg(
        murojaah
          .map((m) => MUROJAAH_PCT[m.status_kelancaran])
          .filter((n): n is number => n !== undefined)
      );

      const tibyan_pct = avg(
        tibyan.filter((t) => t.target > 0).map((t) => (t.progres / t.target) * 100)
      );

      const tarbiyyah_pct = tarbiyyah.some((t) => (t.status_capaian ?? '').trim() !== '') ? 100 : 0;

      const adab_pct = avg(adab.map((a) => a.nilai));

      const data = { kehadiran_pct, ziyadah_pct, murojaah_pct, tibyan_pct, tarbiyyah_pct, adab_pct };
      const existing = await prisma.progresMingguan.findFirst({ where: { id_santri, key_minggu: wk } });

      if (existing) {
        await prisma.progresMingguan.update({ where: { id_progres: existing.id_progres }, data });
      } else {
        await prisma.progresMingguan.create({
          data: { id_progres: randomUUID(), id_santri, tanggal: weekStart, key_minggu: wk, ...data },
        });
      }
      updated++;
    }
  }

  return NextResponse.json({ success: true, updated, weeksProcessed: weekKeys.length });
}
