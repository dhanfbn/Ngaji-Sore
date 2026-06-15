import { KPICardSkeleton } from '@/components/dashboard/KPICard';
import { ProgressChartSkeleton } from '@/components/dashboard/ProgressChart';
import { AchievementTableSkeleton } from '@/components/dashboard/AchievementTable';
import { TeacherNotesSkeleton } from '@/components/dashboard/TeacherNotes';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-72 rounded-lg" />
        <Skeleton className="h-4 w-56 rounded" />
      </div>

      {/* KPI skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      {/* Chart + Notes skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 min-h-[380px]">
          <ProgressChartSkeleton />
        </div>
        <div>
          <TeacherNotesSkeleton />
        </div>
      </div>

      {/* Table skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AchievementTableSkeleton />
        <AchievementTableSkeleton />
      </div>
    </div>
  );
}
