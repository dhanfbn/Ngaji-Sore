import { CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AttendanceCalendarDay } from '@/types/dashboard';

interface AttendanceCalendarCardProps {
  monthLabel: string;
  calendarDays: AttendanceCalendarDay[];
}

const HARI_SINGKAT = ['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'];

const LEGEND = [
  { status: 'hadir_tepat', label: 'Tepat Waktu', dot: 'bg-emerald-400' },
  { status: 'hadir_terlambat', label: 'Terlambat', dot: 'bg-amber-400' },
  { status: 'sakit', label: 'Sakit', dot: 'bg-sky-400' },
  { status: 'izin', label: 'Izin', dot: 'bg-violet-400' },
  { status: 'alpa', label: 'Tanpa Keterangan', dot: 'bg-rose-400' },
] as const;

const DAY_CELL_STYLE: Record<AttendanceCalendarDay['status'], string> = {
  hadir_tepat: 'bg-emerald-400 text-white',
  hadir_terlambat: 'bg-amber-400 text-white',
  sakit: 'bg-sky-400 text-white',
  izin: 'bg-violet-400 text-white',
  alpa: 'bg-rose-400 text-white',
  none: 'bg-slate-100 text-slate-400',
};

// ── Component ──────────────────────────────────────────────────
export function AttendanceCalendarCard({ monthLabel, calendarDays }: AttendanceCalendarCardProps) {
  const leadingBlanks = calendarDays[0]?.weekday ?? 0;

  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardContent className="flex flex-col h-full p-5 sm:p-6">
        <div className="inline-flex items-center gap-2 bg-blue-500 rounded-full pl-1 pr-4 py-1 shadow-sm mb-4 self-start shrink-0">
          <span className="w-6 h-6 rounded-full bg-white text-blue-500 flex items-center justify-center shrink-0">
            <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wide text-white">Kalender Kehadiran</span>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-4">
          {LEGEND.map(l => (
            <span key={l.status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${l.dot}`} aria-hidden="true" />
              {l.label}
            </span>
          ))}
        </div>

        {calendarDays.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-4xl opacity-80" aria-hidden="true">🗓️</span>
            <p className="text-sm font-semibold text-slate-400">Belum ada data</p>
          </div>
        ) : (
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground text-center mb-2">{monthLabel}</p>
            <div className="grid grid-cols-7 gap-1 text-center">
              {HARI_SINGKAT.map(h => (
                <span key={h} className="text-[10px] font-bold text-muted-foreground py-1">{h}</span>
              ))}
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <span key={`blank-${i}`} />
              ))}
              {calendarDays.map(d => (
                <span
                  key={d.day}
                  className={`aspect-square flex items-center justify-center rounded-md text-[11px] font-bold ${DAY_CELL_STYLE[d.status]}`}
                  title={LEGEND.find(l => l.status === d.status)?.label ?? 'Belum ada data'}
                >
                  {d.day}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function AttendanceCalendarCardSkeleton() {
  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <Skeleton className="h-7 w-48 rounded-full" />
        <Skeleton className="h-10 w-full rounded" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
