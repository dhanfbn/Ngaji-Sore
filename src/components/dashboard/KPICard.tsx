import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ── Types ──────────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  /** Numeric percentage 0-100 */
  value: number;
  /** e.g. "Hadir 19 dari 20 pertemuan" */
  detail: string;
  /** e.g. "Sangat Rajin ✨" */
  label: string;
  icon: LucideIcon;
  /** Tailwind colour tokens to drive icon bg, icon colour, progress bar, and badge */
  color: 'blue' | 'green' | 'yellow' | 'purple';
  /** Optional WoW trend vs last period */
  trend?: 'up' | 'down' | 'flat';
}

// Colour map → keeps inline classes purgeable by Tailwind
const COLOR = {
  blue:   { icon: 'bg-blue-50 text-blue-500',   bar: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-700' },
  green:  { icon: 'bg-emerald-50 text-emerald-500', bar: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
  yellow: { icon: 'bg-amber-50 text-amber-500',  bar: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700' },
  purple: { icon: 'bg-violet-50 text-violet-500', bar: 'bg-violet-400', badge: 'bg-violet-100 text-violet-700' },
};

const TREND_ICON = {
  up:   <TrendingUp  className="w-3.5 h-3.5 text-emerald-500" aria-label="Naik" />,
  down: <TrendingDown className="w-3.5 h-3.5 text-red-400" aria-label="Turun" />,
  flat: <Minus       className="w-3.5 h-3.5 text-slate-400" aria-label="Stabil" />,
};

// ── Component ──────────────────────────────────────────────────
export function KPICard({ title, value, detail, label, icon: Icon, color, trend }: KPICardProps) {
  const c = COLOR[color];

  return (
    <Card className="card-3d no-tap-highlight overflow-hidden bg-white">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${c.icon}`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{title}</p>

            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground tabular-nums">
                {value}
              </span>
              <span className="text-lg font-semibold text-muted-foreground">%</span>
              {trend && <span className="ml-1">{TREND_ICON[trend]}</span>}
            </div>

            <p className="text-xs text-muted-foreground truncate mb-3">{detail}</p>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${c.bar}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="mt-4">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${c.badge}`}>
            {label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function KPICardSkeleton() {
  return (
    <Card className="card-3d overflow-hidden bg-white">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-9 w-24 rounded" />
            <Skeleton className="h-3 w-36 rounded" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
        <Skeleton className="h-7 w-28 rounded-full mt-4" />
      </CardContent>
    </Card>
  );
}
