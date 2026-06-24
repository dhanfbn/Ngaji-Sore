import { googleSheetsService } from './googleSheets.service';
import type { KPIData, ChartDataPoint } from '@/types/dashboard';
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
  const hadirCount = kehadiran.filter(k => k.status_kehadiran.trim().toLowerCase() === 'hadir').length;
  const kehadiranPct = totalKehadiran > 0 ? Math.round((hadirCount / totalKehadiran) * 100) : 0;

  let kehadiranLabel = 'Cukup';
  if (kehadiranPct >= 90) kehadiranLabel = 'Sangat Rajin ✨';
  else if (kehadiranPct >= 75) kehadiranLabel = 'Rajin 👍';
  else if (kehadiranPct < 50) kehadiranLabel = 'Perlu Ditingkatkan ⚠️';

  // --- KPI Tilawah ---
  let tilawahPct = 0;
  let tilawahDetail = 'Belum ada data';
  let latestTilawah: typeof tilawah[0] | null = null;
  if (tilawah.length > 0) {
    const sortedTilawah = [...tilawah].sort((a, b) => new Date(b.tanggal_tilawah).getTime() - new Date(a.tanggal_tilawah).getTime());
    latestTilawah = sortedTilawah[0];
    tilawahPct = latestTilawah.target_tilawah > 0 ? Math.round((latestTilawah.progress_tilawah / latestTilawah.target_tilawah) * 100) : 0;
    tilawahDetail = `${latestTilawah.materi_tilawah} · Hal. ${latestTilawah.progress_tilawah} / ${latestTilawah.target_tilawah}`;
  }

  let tilawahLabel = 'Cukup';
  if (tilawahPct >= 100) tilawahLabel = 'Tercapai 🏆';
  else if (tilawahPct >= 80) tilawahLabel = 'Sesuai Target 📗';
  else if (tilawahPct < 50) tilawahLabel = 'Terus Semangat 💪';

  // --- KPI Tahfiz ---
  let tahfizPct = 0;
  let tahfizDetail = 'Belum ada data';
  let latestTahfiz: typeof tahfiz[0] | null = null;
  if (tahfiz.length > 0) {
    const sortedTahfiz = [...tahfiz].sort((a, b) => new Date(b.tanggal_tahfizh).getTime() - new Date(a.tanggal_tahfizh).getTime());
    latestTahfiz = sortedTahfiz[0];
    tahfizPct = latestTahfiz.target_ayat > 0 ? Math.round((latestTahfiz.ayat_selesai / latestTahfiz.target_ayat) * 100) : 0;
    tahfizDetail = `${latestTahfiz.surat} · ${latestTahfiz.ayat_selesai} / ${latestTahfiz.target_ayat} ayat`;
  }

  let tahfizLabel = 'Cukup';
  if (tahfizPct >= 100) tahfizLabel = 'Hafal 🌟';
  else if (tahfizPct >= 80) tahfizLabel = 'Sesuai Target 📗';
  else if (tahfizPct < 50) tahfizLabel = 'Terus Semangat 💪';

  // --- KPI Adab & Doa ---
  let avgAdab = 0;
  let latestAdab: typeof adab[0] | null = null;
  if (adab.length > 0) {
    const sortedAdab = [...adab].sort((a, b) => new Date(b.tanggal_adab).getTime() - new Date(a.tanggal_adab).getTime());
    latestAdab = sortedAdab[0];
    const totalAdab = adab.reduce((sum, a) => sum + a.nilai, 0);
    avgAdab = totalAdab / adab.length;
  }

  let doaPct = 0;
  if (doa.length > 0) {
    const hafalDoa = doa.filter(d => d.status.trim().toLowerCase() === 'hafal').length;
    doaPct = hafalDoa / doa.length;
  }

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

  // --- Dynamic Chart Data: 4-week progression trailing back from latest database date ---
  const dates: Date[] = [];
  kehadiran.forEach(k => { if (k.tanggal_kehadiran) dates.push(new Date(k.tanggal_kehadiran)); });
  tilawah.forEach(t => { if (t.tanggal_tilawah) dates.push(new Date(t.tanggal_tilawah)); });
  tahfiz.forEach(h => { if (h.tanggal_tahfizh) dates.push(new Date(h.tanggal_tahfizh)); });
  adab.forEach(a => { if (a.tanggal_adab) dates.push(new Date(a.tanggal_adab)); });

  let maxDate = new Date();
  if (dates.length > 0) {
    maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  }

  const chartData: ChartDataPoint[] = [];
  for (let w = 1; w <= 4; w++) {
    const weekEnd = new Date(maxDate);
    weekEnd.setDate(maxDate.getDate() - (4 - w) * 7);

    // Kehadiran rate up to weekEnd
    const kHistory = kehadiran.filter(k => new Date(k.tanggal_kehadiran) <= weekEnd);
    const kTotal = kHistory.length;
    const kHadir = kHistory.filter(k => k.status_kehadiran.trim().toLowerCase() === 'hadir').length;
    const kPct = kTotal > 0 ? Math.round((kHadir / kTotal) * 100) : 0;

    // Tilawah rate up to weekEnd
    const tHistory = tilawah.filter(t => new Date(t.tanggal_tilawah) <= weekEnd)
      .sort((a, b) => new Date(b.tanggal_tilawah).getTime() - new Date(a.tanggal_tilawah).getTime());
    const tPct = tHistory.length > 0 && tHistory[0].target_tilawah > 0
      ? Math.round((tHistory[0].progress_tilawah / tHistory[0].target_tilawah) * 100)
      : 0;

    // Tahfiz rate up to weekEnd
    const hHistory = tahfiz.filter(h => new Date(h.tanggal_tahfizh) <= weekEnd)
      .sort((a, b) => new Date(b.tanggal_tahfizh).getTime() - new Date(a.tanggal_tahfizh).getTime());
    const hPct = hHistory.length > 0 && hHistory[0].target_ayat > 0
      ? Math.round((hHistory[0].ayat_selesai / hHistory[0].target_ayat) * 100)
      : 0;

    // Adab rate up to weekEnd
    const aHistory = adab.filter(a => new Date(a.tanggal_adab) <= weekEnd);
    const aAvg = aHistory.length > 0
      ? aHistory.reduce((sum, a) => sum + a.nilai, 0) / aHistory.length
      : 0;
    
    const adabDoaWeekPct = (aHistory.length > 0 || doa.length > 0)
      ? Math.round((aAvg + (doaPct * 100)) / ((aHistory.length > 0 ? 1 : 0) + (doa.length > 0 ? 1 : 0)))
      : 0;

    chartData.push({
      week: `Mg. ${w}`,
      kehadiran: kPct,
      tilawah: tPct,
      tahfiz: hPct,
      adab: adabDoaWeekPct
    });
  }

  // --- Dynamic Current Achievement construction ---
  const currentTargets: TargetPencapaianRow[] = [];

  if (latestTilawah) {
    currentTargets.push({
      id_santri,
      kategori: 'Tilawah',
      target: `${latestTilawah.materi_tilawah} (Hal. ${latestTilawah.progress_tilawah}/${latestTilawah.target_tilawah})`,
      deadline: ''
    });
  }
  if (latestTahfiz) {
    currentTargets.push({
      id_santri,
      kategori: 'Hafalan (Tahfiz)',
      target: `${latestTahfiz.surat} (Ayat ${latestTahfiz.ayat_selesai}/${latestTahfiz.target_ayat})`,
      deadline: ''
    });
  }
  const memorizedDoas = doa.filter(d => d.status.trim().toLowerCase() === 'hafal').map(d => d.nama_doa);
  if (memorizedDoas.length > 0) {
    currentTargets.push({
      id_santri,
      kategori: 'Doa',
      target: `Hafal: ${memorizedDoas.join(', ')}`,
      deadline: ''
    });
  }
  if (latestAdab) {
    currentTargets.push({
      id_santri,
      kategori: 'Adab',
      target: `Sikap & Sopan Santun (Nilai: ${latestAdab.nilai})`,
      deadline: ''
    });
  }

  // Next targets are upcoming target entries fetched from target sheet
  const nextTargets = targets;

  return {
    kpi,
    chartData,
    currentTargets,
    nextTargets,
    notes: catatan,
    studentName: santri?.nama || 'Santri'
  };
}
