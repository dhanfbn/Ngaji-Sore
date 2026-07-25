import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ZiyadahNoteCardProps {
  icon: LucideIcon;
  pillColor: string;
  iconColor: string;
  boxColor: string;
  title: string;
  text: string;
}

// ── Component ──────────────────────────────────────────────────
export function ZiyadahNoteCard({ icon: Icon, pillColor, iconColor, boxColor, title, text }: ZiyadahNoteCardProps) {
  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardContent className="flex flex-col h-full p-5 sm:p-6">
        <div className={`inline-flex items-center gap-2 ${pillColor} rounded-full pl-1 pr-4 py-1 shadow-sm mb-4 self-start shrink-0`}>
          <span className={`w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 ${iconColor}`}>
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wide text-white">{title}</span>
        </div>

        <div className={`flex-1 rounded-2xl border p-4 ${boxColor}`}>
          <p className="text-sm text-foreground leading-relaxed">{text}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function ZiyadahNoteCardSkeleton() {
  return (
    <Card className="card-3d overflow-hidden bg-white">
      <CardContent className="p-5 sm:p-6">
        <Skeleton className="h-7 w-48 rounded-full mb-4" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </CardContent>
    </Card>
  );
}
