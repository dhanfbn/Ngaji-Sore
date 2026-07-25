import { ZiyadahSummaryCardSkeleton } from '@/components/ziyadah/ZiyadahSummaryCard';
import { ZiyadahPencapaianCardSkeleton } from '@/components/ziyadah/ZiyadahPencapaianCard';
import { ZiyadahLogTableSkeleton } from '@/components/ziyadah/ZiyadahLogTable';
import { ZiyadahNoteCardSkeleton } from '@/components/ziyadah/ZiyadahNoteCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function ZiyadahLoading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Greeting skeleton */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <Skeleton className="h-11 w-40 rounded-2xl" />
      </div>

      {/* Ringkasan / Analisis Pencapaian skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ZiyadahSummaryCardSkeleton />
        <ZiyadahPencapaianCardSkeleton />
      </div>

      {/* Log table skeleton */}
      <ZiyadahLogTableSkeleton />

      {/* Catatan strategi / target pekan depan skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ZiyadahNoteCardSkeleton />
        <ZiyadahNoteCardSkeleton />
      </div>
    </div>
  );
}
