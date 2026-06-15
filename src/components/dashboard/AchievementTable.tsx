import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TargetPencapaianRow } from '@/types/database';

// ── Category → icon map ────────────────────────────────────────
const CATEGORY_ICON: Record<string, string> = {
  'Tilawah':  '📖',
  'Hafalan':  '⭐',
  'Dzikir':   '🤲',
  'Shiroh':   '📜',
  'Adab':     '💚',
};

function getCategoryIcon(kategori: string): string {
  for (const [key, icon] of Object.entries(CATEGORY_ICON)) {
    if (kategori.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '📋';
}

// ── Deadline chip colours ──────────────────────────────────────
function DeadlineChip({ text }: { text: string }) {
  const isUrgent = text.toLowerCase().includes('minggu');
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap
        ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
    >
      {isUrgent ? '⚡ ' : '📅 '}{text}
    </span>
  );
}

// ── Types ──────────────────────────────────────────────────────
interface AchievementTableProps {
  title: string;
  icon: string;
  data: TargetPencapaianRow[];
  /** When true, shows the Deadline column */
  isTarget?: boolean;
}

// ── Component ──────────────────────────────────────────────────
export function AchievementTable({ title, icon, data, isTarget = false }: AchievementTableProps) {
  return (
    <Card className="h-full card-3d overflow-hidden flex flex-col bg-white">
      <CardHeader className="pb-3 pt-5 px-5 sm:px-6 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
          <span aria-hidden="true">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex-1 relative">
        {data.length === 0 ? (
          <EmptyState label={isTarget ? 'Belum ada target selanjutnya' : 'Belum ada capaian'} />
        ) : (
          <div className="w-full overflow-x-auto custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-sm text-left min-w-[500px]" aria-label={title}>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 sm:px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider w-1/3">
                    Kategori
                  </th>
                  <th className="px-5 sm:px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider">
                    {isTarget ? 'Target' : 'Capaian'}
                  </th>
                  {isTarget && (
                    <th className="px-5 sm:px-6 py-3 font-bold text-xs text-muted-foreground uppercase tracking-wider w-1/4">
                      Deadline
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, i) => (
                  <tr
                    key={i}
                    className="bg-white hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-5 sm:px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                      <span className="mr-2" aria-hidden="true">{getCategoryIcon(row.kategori)}</span>
                      {row.kategori}
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-slate-600">
                      {row.target}
                    </td>
                    {isTarget && (
                      <td className="px-5 sm:px-6 py-4">
                        {row.deadline ? <DeadlineChip text={row.deadline} /> : <span className="text-muted-foreground">—</span>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Empty State ────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
      <span className="text-4xl opacity-80" aria-hidden="true">🍃</span>
      <p className="text-sm font-semibold text-slate-400">{label}</p>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function AchievementTableSkeleton() {
  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100">
        <Skeleton className="h-6 w-44 rounded-full" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="h-4 w-1/3 rounded-full" />
              <Skeleton className="h-4 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
