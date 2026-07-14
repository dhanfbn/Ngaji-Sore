import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';
import type { CatatanAnakRow } from '@/types/database';

interface CatatanAnakCardProps {
  notes: CatatanAnakRow[];
}

// ── Component ──────────────────────────────────────────────────
export function CatatanAnakCard({ notes }: CatatanAnakCardProps) {
  const latest = notes[0];

  return (
    <Card className="flex-1 flex flex-col card-3d overflow-hidden bg-white">
      <CardContent className="flex-1 flex flex-col p-5 sm:p-6">
        <div className="inline-flex items-center gap-2 bg-sky-500 rounded-full pl-1 pr-4 py-1 shadow-sm mb-4 self-start shrink-0">
          <span className="w-6 h-6 rounded-full bg-white text-sky-500 flex items-center justify-center shrink-0">
            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" fill="currentColor" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wide text-white">Catatan Anak</span>
        </div>

        {latest ? (
          <div className="flex-1 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
            <p className="text-sm text-foreground leading-relaxed">{latest.isi_catatan}</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-4xl opacity-80" aria-hidden="true">🍃</span>
            <p className="text-sm font-semibold text-slate-400">Belum ada catatan dari guru</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function CatatanAnakCardSkeleton() {
  return (
    <Card className="card-3d overflow-hidden bg-white">
      <CardContent className="p-5 sm:p-6">
        <Skeleton className="h-7 w-36 rounded-full mb-4" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </CardContent>
    </Card>
  );
}
