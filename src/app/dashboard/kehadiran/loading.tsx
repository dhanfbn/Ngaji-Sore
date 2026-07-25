import { AttendanceSummaryCardSkeleton } from '@/components/kehadiran/AttendanceSummaryCard';
import { AttendanceClassificationCardSkeleton } from '@/components/kehadiran/AttendanceClassificationCard';
import { AttendanceCalendarCardSkeleton } from '@/components/kehadiran/AttendanceCalendarCard';
import { AttendanceLogTableSkeleton } from '@/components/kehadiran/AttendanceLogTable';
import { Skeleton } from '@/components/ui/skeleton';

export default function KehadiranLoading() {
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

      {/* Ringkasan / Klasifikasi / Kalender skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <AttendanceSummaryCardSkeleton />
        <AttendanceClassificationCardSkeleton />
        <AttendanceCalendarCardSkeleton />
      </div>

      {/* Log table skeleton */}
      <AttendanceLogTableSkeleton />
    </div>
  );
}
