'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ChartDataPoint } from '@/lib/mock-data';

// ── Design System palette (matches CSS vars) ───────────────────
const COLORS = {
  kehadiran: '#3B82F6',
  tilawah: '#10B981',
  tahfiz: '#F59E0B',
  adab: '#8B5CF6',
};

const SERIES = [
  { key: 'kehadiran', name: 'Kehadiran', color: COLORS.kehadiran },
  { key: 'tilawah', name: 'Tilawah', color: COLORS.tilawah },
  { key: 'tahfiz', name: 'Tahfiz', color: COLORS.tahfiz },
  { key: 'adab', name: 'Adab & Doa', color: COLORS.adab },
] as const;

// ── Custom Tooltip ─────────────────────────────────────────────
interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-2xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-bold text-foreground mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}
          </span>
          <span className="font-bold tabular-nums" style={{ color: entry.color }}>
            {entry.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Legend renderer ────────────────────────────────────────────
function CustomLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-2">
      {SERIES.map((s) => (
        <span key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
          {s.name}
        </span>
      ))}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────
interface ProgressChartProps {
  data: ChartDataPoint[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardHeader className="pb-0 pt-5 px-5 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
          <span aria-hidden="true">📈</span>
          Perkembangan 4 Minggu
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 pb-4 pt-4">
        <div className="h-[260px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748B' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748B' }}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 2 }} />
              {SERIES.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: s.color }}
                  activeDot={{ r: 7, strokeWidth: 2, fill: '#fff', stroke: s.color }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend />
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function ProgressChartSkeleton() {
  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardHeader className="pb-0 pt-5 px-6">
        <Skeleton className="h-6 w-56 rounded" />
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-4 space-y-3">
        <Skeleton className="h-[280px] w-full rounded-xl" />
        <div className="flex justify-center gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16 rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
