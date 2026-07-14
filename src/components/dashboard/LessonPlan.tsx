import { ClipboardList, Pencil, BookOpen, RotateCcw, Sprout, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LessonPlanDay } from '@/types/dashboard';

interface LessonPlanCardProps {
  tema?: string;
  hari: LessonPlanDay[];
}

const HARI_COLOR: Record<string, string> = {
  Senin: 'bg-amber-300 text-amber-900',
  Selasa: 'bg-rose-300 text-rose-900',
  Rabu: 'bg-sky-300 text-sky-900',
  Kamis: 'bg-lime-300 text-lime-900',
  Jumat: 'bg-orange-400 text-white',
  Sabtu: 'bg-purple-300 text-purple-900',
  Ahad: 'bg-teal-300 text-teal-900',
};

const CATEGORY_ICON: Record<string, LucideIcon> = {
  tibyan: Pencil,
  ziyadah: BookOpen,
  murojaah: RotateCcw,
  tarbiyyah: Sprout,
};

function CategoryIcon({ kategori }: { kategori: string }) {
  const key = Object.keys(CATEGORY_ICON).find(k => kategori.toLowerCase().includes(k));
  if (!key) return <span className="text-lg leading-none" aria-hidden="true">🤲</span>;
  const Icon = CATEGORY_ICON[key];
  return <Icon className="w-4 h-4 text-slate-500" aria-hidden="true" />;
}

// ── Component ──────────────────────────────────────────────────
export function LessonPlanCard({ tema, hari }: LessonPlanCardProps) {
  return (
    <Card className="h-full card-3d overflow-hidden bg-white py-0">
      <div className="bg-violet-600 px-5 sm:px-6 py-3 flex items-center gap-2 shrink-0">
        <ClipboardList className="w-5 h-5 text-white shrink-0" aria-hidden="true" />
        <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-white">Lesson Plan Mingguan</h3>
      </div>

      <CardContent className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-6 py-4">
        {hari.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-4xl opacity-80" aria-hidden="true">📋</span>
            <p className="text-sm font-semibold text-slate-400">Lesson plan minggu ini belum diisi guru</p>
            <p className="text-xs text-muted-foreground">Silakan cek kembali nanti</p>
          </div>
        ) : (
          <>
            {tema && (
              <p className="text-sm text-foreground mb-4">
                <span className="font-bold">Tema Minggu Ini:</span> {tema}
              </p>
            )}
            <div className="space-y-2.5">
              {hari.map((d, i) => (
                <div key={i} className="rounded-xl border border-slate-100 px-3 py-2.5">
                  <span className={`inline-block text-center text-xs font-bold rounded-full px-3 py-1 mb-1.5 ${HARI_COLOR[d.hari] ?? 'bg-slate-200 text-slate-700'}`}>
                    {d.hari}
                  </span>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5"><CategoryIcon kategori={d.kategori} /></span>
                    <span className="text-sm text-foreground leading-snug">
                      <span className="font-semibold">{d.kategori}:</span> {d.materi}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function LessonPlanCardSkeleton() {
  return (
    <Card className="card-3d overflow-hidden bg-white py-0">
      <div className="bg-violet-600 px-5 sm:px-6 py-3">
        <Skeleton className="h-5 w-44 rounded bg-violet-400" />
      </div>
      <CardContent className="px-5 sm:px-6 py-4 space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-xl" />
        ))}
      </CardContent>
    </Card>
  );
}
