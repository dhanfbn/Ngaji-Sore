/** Badge thresholds per CLAUDE.md v2 spec — `>` consistently at every boundary. */
export function getBadgeLabel(value: number): string {
  if (value > 90) return 'Sangat Baik';
  if (value > 80) return 'Baik Sekali';
  if (value > 70) return 'Baik';
  if (value > 50) return 'Rajin';
  return 'Perlu Perhatian';
}
