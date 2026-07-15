/**
 * Badge thresholds per CLAUDE.md v2 spec, updated per product owner:
 * boundaries are `<20`, `<50`, `<80`, else top bucket (>=80).
 * "Adab Harian" uses its own label set; every other KPI shares the generic one.
 */
export function getBadgeLabel(value: number, kategori?: string): string {
  if (kategori === 'adab') {
    if (value < 20) return 'Butuh Pendampingan';
    if (value < 50) return 'Butuh Bimbingan';
    if (value < 80) return 'Baik';
    return 'Sangat Baik';
  }

  if (value < 20) return 'Pasif';
  if (value < 50) return 'Mengikuti Sedikit';
  if (value < 80) return 'Mengikuti Sebagian';
  return 'Aktif Mengikuti';
}
