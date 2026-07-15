import { LucideIcon, TrendingUp, TrendingDown, Minus, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getBadgeLabel } from '@/lib/kpi';

// ── Types ──────────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  /** Numeric percentage 0-100 */
  value: number;
  /** e.g. "Hadir 19 dari 20 pertemuan" */
  detail: string;
  /** Badge label; falls back to the computed threshold label when omitted */
  label?: string;
  icon: LucideIcon;
  /** Tailwind colour tokens to drive icon bg, icon colour, progress bar, and badge */
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'rose' | 'cyan';
  /** Optional WoW trend vs last period */
  trend?: 'up' | 'down' | 'flat';
  /** If true, show locked state (for disabled menu items per v2 scope) */
  locked?: boolean;
}

// Colour map → keeps inline classes purgeable by Tailwind
const COLOR = {
  blue:   { icon: 'bg-blue-50 text-blue-500',   bar: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-700' },
  green:  { icon: 'bg-emerald-50 text-emerald-500', bar: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
  yellow: { icon: 'bg-amber-50 text-amber-500',  bar: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700' },
  purple: { icon: 'bg-violet-50 text-violet-500', bar: 'bg-violet-400', badge: 'bg-violet-100 text-violet-700' },
  rose:   { icon: 'bg-rose-50 text-rose-500',    bar: 'bg-rose-400',   badge: 'bg-rose-100 text-rose-700' },
  cyan:   { icon: 'bg-cyan-50 text-cyan-500',    bar: 'bg-cyan-400',   badge: 'bg-cyan-100 text-cyan-700' },
};

const TREND_ICON = {
  up:   <TrendingUp  className="w-3 h-3 text-emerald-500" aria-label="Naik" />,
  down: <TrendingDown className="w-3 h-3 text-red-400" aria-label="Turun" />,
  flat: <Minus       className="w-3 h-3 text-slate-400" aria-label="Stabil" />,
};

const BADGE_EMOJI: Record<string, string> = {
  'Butuh Pendampingan': '🆘',
  'Butuh Bimbingan': '🧭',
  'Baik': '👍',
  'Sangat Baik': '💎',
  'Pasif': '😴',
  'Mengikuti Sedikit': '🙂',
  'Mengikuti Sebagian': '💪',
  'Aktif Mengikuti': '🌟',
};

// ── Component ──────────────────────────────────────────────────
export function KPICard({ title, value, detail, label, icon: Icon, color, trend, locked }: KPICardProps) {
  const c = COLOR[color];
  const displayLabel = label || getBadgeLabel(value);
  const emoji = BADGE_EMOJI[displayLabel] ?? '';

  return (
    <Card className={`card-3d no-tap-highlight overflow-hidden ${locked ? 'bg-slate-50' : 'bg-white'}`}>
      <CardContent className={`p-4 relative ${locked ? 'opacity-60' : ''}`}>
        {locked && (
          <div className="absolute top-2 right-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" aria-label="Terkunci" />
          </div>
        )}

        {/* Icon + title */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.icon}`}>
            <Icon className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">{title}</p>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">%</span>
          {trend && <span className="ml-0.5">{TREND_ICON[trend]}</span>}
        </div>

        <p className="text-xs text-muted-foreground truncate mb-2.5">{detail}</p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${c.bar}`}
            style={{ width: `${value}%` }}
          />
        </div>

        {/* Badge */}
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${c.badge}`}>
          {displayLabel} <span aria-hidden="true">{emoji}</span>
        </span>
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function KPICardSkeleton({ locked }: { locked?: boolean } = {}) {
  return (
    <Card className={`card-3d overflow-hidden ${locked ? 'bg-slate-50' : 'bg-white'}`}>
      <CardContent className={`p-4 relative ${locked ? 'opacity-60' : ''}`}>
        {locked && (
          <div className="absolute top-2 right-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" aria-label="Terkunci" />
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <Skeleton className="h-7 w-16 rounded mb-1.5" />
        <Skeleton className="h-3 w-28 rounded mb-2.5" />
        <Skeleton className="h-1.5 w-full rounded-full mb-3" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </CardContent>
    </Card>
  );
}
