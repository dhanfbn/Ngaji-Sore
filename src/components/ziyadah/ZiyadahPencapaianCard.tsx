'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ZiyadahPencapaian } from '@/types/dashboard';

interface ZiyadahPencapaianCardProps {
  pencapaian: ZiyadahPencapaian;
}

const SEGMENTS = [
  { key: 'lancarAyat' as const, label: 'Lancar', color: '#10B981' },
  { key: 'cukupAyat' as const, label: 'Cukup Lancar', color: '#F59E0B' },
  { key: 'perluAyat' as const, label: 'Perlu Diperbaiki', color: '#F43F5E' },
];

// ── Component ──────────────────────────────────────────────────
export function ZiyadahPencapaianCard({ pencapaian }: ZiyadahPencapaianCardProps) {
  const data = SEGMENTS.map(s => ({ ...s, value: pencapaian[s.key] }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardContent className="flex flex-col h-full p-5 sm:p-6">
        <div className="inline-flex items-center gap-2 bg-amber-500 rounded-full pl-1 pr-4 py-1 shadow-sm mb-4 self-start shrink-0">
          <span className="w-6 h-6 rounded-full bg-white text-amber-500 flex items-center justify-center shrink-0">
            <PieChartIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wide text-white">Analisis Tingkat Pencapaian Ziyadah</span>
        </div>

        {total === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-4xl opacity-80" aria-hidden="true">🍃</span>
            <p className="text-sm font-semibold text-slate-400">Belum ada data ziyadah bulan ini</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-5">
            <div className="w-28 h-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="label" innerRadius={28} outerRadius={54} paddingAngle={2} strokeWidth={0}>
                    {data.map(d => <Cell key={d.key} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} Ayat`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2.5 min-w-0">
              {data.map(d => (
                <div key={d.key} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} aria-hidden="true" />
                    {d.label}
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums">{d.value} Ayat</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function ZiyadahPencapaianCardSkeleton() {
  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <Skeleton className="h-7 w-64 rounded-full" />
        <div className="flex items-center gap-5">
          <Skeleton className="w-28 h-28 rounded-full shrink-0" />
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
