import { CalendarCheck2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AttendanceSummary } from '@/types/dashboard';

interface AttendanceSummaryCardProps {
  monthLabel: string;
  summary: AttendanceSummary;
}

function AttendanceRing({ pct }: { pct: number }) {
  const size = 128;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#10B981"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-extrabold text-emerald-600 tabular-nums">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────
export function AttendanceSummaryCard({ monthLabel, summary }: AttendanceSummaryCardProps) {
  const { totalHariSekolah, hadirCount, attendancePct, tepatWaktuCount, terlambatCount } = summary;

  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardContent className="flex flex-col h-full p-5 sm:p-6">
        <div className="inline-flex items-center gap-2 bg-emerald-500 rounded-full pl-1 pr-4 py-1 shadow-sm mb-4 self-start shrink-0">
          <span className="w-6 h-6 rounded-full bg-white text-emerald-500 flex items-center justify-center shrink-0">
            <CalendarCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wide text-white">Ringkasan Kehadiran {monthLabel}</span>
        </div>

        {totalHariSekolah === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-4xl opacity-80" aria-hidden="true">🍃</span>
            <p className="text-sm font-semibold text-slate-400">Belum ada data kehadiran bulan ini</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-5">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <AttendanceRing pct={attendancePct} />
              <span className="text-xs font-semibold text-muted-foreground">{hadirCount}/{totalHariSekolah} Hari</span>
            </div>
            <div className="flex-1 space-y-2.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Total Hari Sekolah</span>
                <span className="text-sm font-bold text-foreground tabular-nums">{totalHariSekolah}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Kehadiran Tepat Waktu</span>
                <span className="text-sm font-bold text-emerald-600 tabular-nums">{tepatWaktuCount}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Keterlambatan</span>
                <span className="text-sm font-bold text-amber-600 tabular-nums">{terlambatCount}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function AttendanceSummaryCardSkeleton() {
  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <Skeleton className="h-7 w-56 rounded-full" />
        <div className="flex items-center gap-5">
          <Skeleton className="w-32 h-32 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
