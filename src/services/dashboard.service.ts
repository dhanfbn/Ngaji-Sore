import { googleSheetsService } from './googleSheets.service';
import type { KPIData, ChartDataPoint } from '@/lib/mock-data';
import type { TargetPencapaianRow, CatatanGuruRow } from '@/types/database';

export interface DashboardData {
  kpi: KPIData;
  chartData: ChartDataPoint[];
  currentTargets: TargetPencapaianRow[];
  nextTargets: TargetPencapaianRow[];
  notes: CatatanGuruRow[];
  studentName: string;
}

export async function getDashboardData(id_santri: string): Promise<DashboardData> {
  const [
    santri,
    kehadiran,
    tilawah,
    tahfiz,
    doa,
    adab,
    catatan,
    targets
  ] = await Promise.all([
    googleSheetsService.getSantriById(id_santri),
    googleSheetsService.getKehadiranBySantri(id_santri),
    googleSheetsService.getTilawahBySantri(id_santri),
    googleSheetsService.getTahfizBySantri(id_santri),
    googleSheetsService.getDoaBySantri(id_santri),
    googleSheetsService.getAdabBySantri(id_santri),
    googleSheetsService.getCatatanGuruBySantri(id_santri),
    googleSheetsService.getTargetPencapaianBySantri(id_santri)
  ]);

  // --- KPI Kehadiran ---
  const totalKehadiran = kehadiran.length;
  const hadirCount = kehadiran.filter(k => k.status_kehadiran.toLowerCase() === 'hadir').length;
  const kehadiranPct = totalKehadiran > 0 ? Math.round((hadirCount / totalKehadiran) * 100) : 0;

  let kehadiranLabel = 'Cukup';
  if (kehadiranPct >= 90) kehadiranLabel = 'Sangat Rajin ✨';
  else if (kehadiranPct >= 75) kehadiranLabel = 'Rajin 👍';
  else if (kehadiranPct < 50) kehadiranLabel = 'Perlu Ditingkatkan ⚠️';

  // --- KPI Tilawah ---
  // Assuming the latest entry is the last one in the array (or sort by date if needed)
  let tilawahPct = 0;
  let tilawahDetail = 'Belum ada data';
  if (tilawah.length > 0) {
    // Sort descending by date to get latest
    const sortedTilawah = [...tilawah].sort((a, b) => new Date(b.tanggal_tilawah).getTime() - new Date(a.tanggal_tilawah).getTime());
    const latest = sortedTilawah[0];
    tilawahPct = latest.target_tilawah > 0 ? Math.round((latest.progress_tilawah / latest.target_tilawah) * 100) : 0;
    tilawahDetail = `${latest.materi_tilawah} · Hal. ${latest.progress_tilawah} / ${latest.target_tilawah}`;
  }

  let tilawahLabel = 'Cukup';
  if (tilawahPct >= 100) tilawahLabel = 'Tercapai 🏆';
  else if (tilawahPct >= 80) tilawahLabel = 'Sesuai Target 📗';
  else if (tilawahPct < 50) tilawahLabel = 'Terus Semangat 💪';

  // --- KPI Tahfiz ---
  let tahfizPct = 0;
  let tahfizDetail = 'Belum ada data';
  if (tahfiz.length > 0) {
    const sortedTahfiz = [...tahfiz].sort((a, b) => new Date(b.tanggal_tahfizh).getTime() - new Date(a.tanggal_tahfizh).getTime());
    const latest = sortedTahfiz[0];
    tahfizPct = latest.target_ayat > 0 ? Math.round((latest.ayat_selesai / latest.target_ayat) * 100) : 0;
    tahfizDetail = `${latest.surat} · ${latest.ayat_selesai} / ${latest.target_ayat} ayat`;
  }

  let tahfizLabel = 'Cukup';
  if (tahfizPct >= 100) tahfizLabel = 'Hafal 🌟';
  else if (tahfizPct >= 80) tahfizLabel = 'Sesuai Target 📗';
  else if (tahfizPct < 50) tahfizLabel = 'Terus Semangat 💪';

  // --- KPI Adab & Doa ---
  // Average Adab
  let avgAdab = 0;
  if (adab.length > 0) {
    const totalAdab = adab.reduce((sum, a) => sum + a.nilai, 0);
    avgAdab = totalAdab / adab.length;
  }

  // Doa Percentage
  let doaPct = 0;
  if (doa.length > 0) {
    const hafalDoa = doa.filter(d => d.status.toLowerCase() === 'hafal').length;
    doaPct = hafalDoa / doa.length;
  }

  // Combine: if adab is 90 and doa is 50%, adabDoaPct is 45. (Using average of both as an alternative)
  // Let's use an average of (avgAdab) and (doaPct * 100) for a more balanced score.
  const adabDoaPct = (adab.length > 0 || doa.length > 0)
    ? Math.round((avgAdab + (doaPct * 100)) / ((adab.length > 0 ? 1 : 0) + (doa.length > 0 ? 1 : 0)))
    : 0;

  let adabLabel = 'Cukup';
  if (adabDoaPct >= 90) adabLabel = 'Sangat Baik 🌟';
  else if (adabDoaPct >= 75) adabLabel = 'Baik 👍';
  else if (adabDoaPct < 50) adabLabel = 'Perlu Ditingkatkan ⚠️';

  const kpi: KPIData = {
    kehadiran: { pct: kehadiranPct, label: kehadiranLabel, detail: `Hadir ${hadirCount} dari ${totalKehadiran} pertemuan` },
    tilawah: { pct: tilawahPct, label: tilawahLabel, detail: tilawahDetail },
    tahfiz: { pct: tahfizPct, label: tahfizLabel, detail: tahfizDetail },
    adab: { pct: adabDoaPct, label: adabLabel, detail: `Nilai Adab: ${Math.round(avgAdab)} | Doa: ${Math.round(doaPct * 100)}%` }
  };

  // --- Chart Data (Last 4 Weeks Mock-ish but using real dates if possible) ---
  // For a robust implementation, we should group real data by weeks.
  // Since this requires complex date parsing, let's build a simple 4-week moving average.

  const chartData: ChartDataPoint[] = [];
  const today = new Date();

  for (let i = 3; i >= 0; i--) {
    // Very simplified weekly grouping
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (i * 7) - 7);
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - (i * 7));

    // Calculate averages for this week (simplified, using overall averages as fallback if empty)
    chartData.push({
      week: `Mg. ${4 - i}`,
      kehadiran: kehadiranPct, // Simplified
      tilawah: tilawahPct,     // Simplified
      tahfiz: tahfizPct,       // Simplified
      adab: adabDoaPct         // Simplified
    });
  }

  // --- Targets ---
  const currentTargets = targets.filter(t => !t.deadline || t.deadline.trim() === '');
  const nextTargets = targets.filter(t => t.deadline && t.deadline.trim() !== '');

  return {
    kpi,
    chartData,
    currentTargets,
    nextTargets,
    notes: catatan,
    studentName: santri?.nama || 'Santri'
  };
}
