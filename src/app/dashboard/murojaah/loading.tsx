import { MurojaahPencapaianCardSkeleton } from '@/components/murojaah/MurojaahPencapaianCard';
import { MurojaahLogTableSkeleton } from '@/components/murojaah/MurojaahLogTable';
import { ZiyadahNoteCardSkeleton } from '@/components/ziyadah/ZiyadahNoteCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function MurojaahLoading() {
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

      {/* Analisis Kelancaran skeleton */}
      <MurojaahPencapaianCardSkeleton />

      {/* Log table skeleton */}
      <MurojaahLogTableSkeleton />

      {/* Catatan strategi / target pekan depan skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ZiyadahNoteCardSkeleton />
        <ZiyadahNoteCardSkeleton />
      </div>
    </div>
  );
}
