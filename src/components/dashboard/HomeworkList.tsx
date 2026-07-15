import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { House, CheckCircle2, Circle } from 'lucide-react';
import type { HomeworkItem } from '@/types/dashboard';

interface HomeworkListProps {
  data: HomeworkItem[];
}

// ── Component ──────────────────────────────────────────────────
export function HomeworkList({ data }: HomeworkListProps) {
  return (
    <Card className="flex-1 flex flex-col min-h-0 card-3d overflow-hidden bg-white">
      <CardContent className="flex-1 flex flex-col min-h-0 p-5 sm:p-6">
        <div className="inline-flex items-center gap-2 bg-emerald-500 rounded-full pl-1 pr-4 py-1 shadow-sm mb-4 self-start shrink-0">
          <span className="w-6 h-6 rounded-full bg-white text-emerald-500 flex items-center justify-center shrink-0">
            <House className="w-3.5 h-3.5" aria-hidden="true" fill="currentColor" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wide text-white">Tugas di Rumah</span>
        </div>

        {data.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-4xl opacity-80" aria-hidden="true">🍃</span>
            <p className="text-sm font-semibold text-slate-400">Belum ada tugas rumah dari guru</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 overflow-y-auto overscroll-contain max-h-60 sm:max-h-72 pr-1">
            {data.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 min-w-0">
                {item.status === 'selesai' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" aria-label="Selesai" />
                ) : (
                  <Circle className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" aria-label="Belum selesai" />
                )}
                <span className={`text-sm break-words ${item.status === 'selesai' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {item.deskripsi}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function HomeworkListSkeleton() {
  return (
    <Card className="card-3d overflow-hidden bg-white">
      <CardContent className="p-5 sm:p-6">
        <Skeleton className="h-7 w-40 rounded-full mb-4" />
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
