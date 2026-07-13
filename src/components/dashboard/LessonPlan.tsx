import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LessonPlanDay } from '@/types/dashboard';

interface LessonPlanCardProps {
  tema?: string;
  hari: LessonPlanDay[];
}

// ── Component ──────────────────────────────────────────────────
export function LessonPlanCard({ tema, hari }: LessonPlanCardProps) {
  return (
    <Card className="h-full card-3d overflow-hidden flex flex-col bg-white">
      <CardHeader className="pb-3 pt-5 px-5 sm:px-6 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
          <span aria-hidden="true">📚</span>
          Lesson Plan Mingguan
        </CardTitle>
        {tema && (
          <p className="text-xs text-muted-foreground mt-1">Tema minggu ini: <span className="font-semibold text-foreground">{tema}</span></p>
        )}
      </CardHeader>

      <CardContent className="flex-1 px-4 sm:px-5 py-4">
        {hari.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <span className="text-4xl opacity-80" aria-hidden="true">📋</span>
            <p className="text-sm font-semibold text-slate-400">Lesson plan minggu ini belum diisi guru</p>
            <p className="text-xs text-muted-foreground">Silakan cek kembali nanti</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {hari.map((d, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                <span className="w-16 shrink-0 text-xs font-bold text-muted-foreground uppercase tracking-wider">{d.hari}</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 shrink-0">
                  {d.kategori}
                </span>
                <span className="text-sm text-foreground truncate">{d.materi}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function LessonPlanCardSkeleton() {
  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100">
        <Skeleton className="h-6 w-52 rounded-full" />
      </CardHeader>
      <CardContent className="px-5 py-4 space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-2xl" />
        ))}
      </CardContent>
    </Card>
  );
}
