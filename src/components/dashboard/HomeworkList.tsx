import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Circle } from 'lucide-react';
import type { HomeworkItem } from '@/types/dashboard';

interface HomeworkListProps {
  data: HomeworkItem[];
}

// ── Component ──────────────────────────────────────────────────
export function HomeworkList({ data }: HomeworkListProps) {
  return (
    <Card className="h-full card-3d overflow-hidden flex flex-col bg-white">
      <CardHeader className="pb-3 pt-5 px-5 sm:px-6 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
          <span aria-hidden="true">✅</span>
          Tugas di Rumah
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 px-4 sm:px-5 py-4">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <span className="text-4xl opacity-80" aria-hidden="true">🍃</span>
            <p className="text-sm font-semibold text-slate-400">Belum ada tugas rumah dari guru</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {data.map((item, i) => (
              <li
                key={i}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                  item.status === 'selesai'
                    ? 'border-emerald-100 bg-emerald-50/50'
                    : 'border-slate-100 bg-slate-50/50'
                }`}
              >
                {item.status === 'selesai' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-label="Selesai" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0" aria-label="Belum selesai" />
                )}
                <span className={`text-sm ${item.status === 'selesai' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
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
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100">
        <Skeleton className="h-6 w-40 rounded-full" />
      </CardHeader>
      <CardContent className="px-5 py-4 space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-2xl" />
        ))}
      </CardContent>
    </Card>
  );
}
