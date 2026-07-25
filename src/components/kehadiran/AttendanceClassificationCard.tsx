import { ListChecks, HeartPulse, Mail, XCircle, CheckCircle2, AlarmClock, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AttendanceSummary } from '@/types/dashboard';

interface AttendanceClassificationCardProps {
  summary: AttendanceSummary;
}

const ABSENCE_TYPES = [
  { key: 'sakitCount' as const, label: 'Sakit', icon: HeartPulse, color: 'bg-sky-50 text-sky-500' },
  { key: 'izinCount' as const, label: 'Izin', icon: Mail, color: 'bg-violet-50 text-violet-500' },
  { key: 'alpaCount' as const, label: 'Tanpa Keterangan', icon: XCircle, color: 'bg-rose-50 text-rose-500' },
];

// ── Component ──────────────────────────────────────────────────
export function AttendanceClassificationCard({ summary }: AttendanceClassificationCardProps) {
  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardContent className="flex flex-col h-full p-5 sm:p-6">
        <div className="inline-flex items-center gap-2 bg-violet-500 rounded-full pl-1 pr-4 py-1 shadow-sm mb-4 self-start shrink-0">
          <span className="w-6 h-6 rounded-full bg-white text-violet-500 flex items-center justify-center shrink-0">
            <ListChecks className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wide text-white">Klasifikasi Ketidakhadiran &amp; Ketepatan Waktu</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {ABSENCE_TYPES.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="flex flex-col items-center text-center gap-1.5 rounded-2xl bg-slate-50 p-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="text-lg font-extrabold text-foreground tabular-nums leading-none">{summary[key]} Hari</span>
              <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3 mt-auto space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
              Tepat Waktu
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">{summary.tepatWaktuCount}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlarmClock className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
              Terlambat (Frekuensi)
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">{summary.terlambatCount}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              Rata-rata Terlambat
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">{summary.rataRataTerlambatMenit} menit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function AttendanceClassificationCardSkeleton() {
  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <Skeleton className="h-7 w-64 rounded-full" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
