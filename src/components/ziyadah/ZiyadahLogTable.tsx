import { ScrollText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ZiyadahLogRow, ZiyadahPencapaianLevel } from '@/types/dashboard';

interface ZiyadahLogTableProps {
  monthLabel: string;
  log: ZiyadahLogRow[];
}

const PENCAPAIAN_DISPLAY: Record<ZiyadahPencapaianLevel, { className: string }> = {
  lancar: { className: 'bg-emerald-100 text-emerald-700' },
  cukup: { className: 'bg-amber-100 text-amber-700' },
  perlu: { className: 'bg-rose-100 text-rose-700' },
};

// ── Component ──────────────────────────────────────────────────
export function ZiyadahLogTable({ monthLabel, log }: ZiyadahLogTableProps) {
  return (
    <Card className="card-3d overflow-hidden bg-white">
      <CardContent className="p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 bg-slate-700 rounded-full pl-1 pr-4 py-1 shadow-sm mb-6 self-start shrink-0">
          <span className="w-6 h-6 rounded-full bg-white text-slate-700 flex items-center justify-center shrink-0">
            <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wide text-white">Log Ziyadah Harian ({monthLabel})</span>
        </div>

        {log.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 text-center py-10">
            <span className="text-4xl opacity-80" aria-hidden="true">🍃</span>
            <p className="text-sm font-semibold text-slate-400">Belum ada data ziyadah bulan ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar min-h-[420px] sm:min-h-[520px] max-h-[70vh]">
            <table className="w-full text-sm sm:text-base border-collapse min-w-[760px]">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-2 border-border">
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">No.</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Tanggal</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Hari</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Surah</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Rentang Ayat</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Status</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3">Catatan Evaluasi Guru</th>
                </tr>
              </thead>
              <tbody>
                {log.map(row => {
                  const pencapaian = PENCAPAIAN_DISPLAY[row.pencapaian];
                  return (
                    <tr key={row.no} className="border-b border-border last:border-0 hover:bg-slate-50/70">
                      <td className="py-3.5 pr-4 text-muted-foreground tabular-nums">{row.no}</td>
                      <td className="py-3.5 pr-4 font-semibold text-foreground whitespace-nowrap">{row.tanggal}</td>
                      <td className="py-3.5 pr-4 text-muted-foreground whitespace-nowrap">{row.hari}</td>
                      <td className="py-3.5 pr-4 font-semibold text-foreground whitespace-nowrap">{row.surat}</td>
                      <td className="py-3.5 pr-4 text-foreground tabular-nums whitespace-nowrap">{row.ayatDari}-{row.ayatSampai}</td>
                      <td className="py-3.5 pr-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${pencapaian.className}`}>
                          {row.ayatSampai}/{row.targetAyat} ({row.progresPct.toFixed(0)}%)
                        </span>
                      </td>
                      <td className="py-3.5 text-muted-foreground">{row.catatanGuru || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function ZiyadahLogTableSkeleton() {
  return (
    <Card className="card-3d overflow-hidden bg-white">
      <CardContent className="p-5 sm:p-6 space-y-3">
        <Skeleton className="h-7 w-64 rounded-full mb-2" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded" />
        ))}
      </CardContent>
    </Card>
  );
}
