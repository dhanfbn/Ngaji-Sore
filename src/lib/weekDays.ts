/**
 * Client-safe (no server-only imports). Split out from src/lib/weeks.ts
 * because that file pulls in the Prisma-backed db.service.ts.
 */

/** Mon-Fri calendar dates for a week, from a "YYYY-MM-DD" week-start string (always a Monday per ISO week convention). */
export function getDaysInWeek(tanggal_mulai: string): { hari: string; tanggal: string }[] {
  const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const [y, m, d] = tanggal_mulai.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  return HARI.map((hari, i) => {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + i);
    return { hari, tanggal: day.toISOString().slice(0, 10) };
  });
}

const BULAN_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** "Senin, 31 Agustus 2026" from hari="Senin" + tanggal="2026-08-31". */
export function formatFullDate(hari: string, tanggal: string): string {
  const [y, m, d] = tanggal.split('-').map(Number);
  return `${hari}, ${d} ${BULAN_FULL[m - 1]} ${y}`;
}

/** Today's date as "YYYY-MM-DD" in local time. */
export function todayDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
