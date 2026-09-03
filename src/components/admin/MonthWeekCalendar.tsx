'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getISOWeekKey } from '@/lib/date';

export interface WeekSelection {
  key_minggu: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  label: string;
}

interface MonthWeekCalendarProps {
  selectedKey?: string;
  onSelectWeek: (week: WeekSelection) => void;
}

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const HARI_HEADER = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfMondayWeek(d: Date): Date {
  const dayIdx = (d.getDay() + 6) % 7; // 0=Mon..6=Sun
  const result = new Date(d);
  result.setDate(d.getDate() - dayIdx);
  return result;
}

export function MonthWeekCalendar({ selectedKey, onSelectWeek }: MonthWeekCalendarProps) {
  const [viewDate, setViewDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const lastOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const gridStart = startOfMondayWeek(firstOfMonth);
  const gridEndBase = startOfMondayWeek(lastOfMonth);

  const rowStarts: Date[] = [];
  for (let cur = new Date(gridStart); cur <= gridEndBase; cur.setDate(cur.getDate() + 7)) {
    rowStarts.push(new Date(cur));
  }

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white max-w-md">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="p-1 rounded hover:bg-slate-100"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-sm text-slate-700 font-poppins">{BULAN[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="p-1 rounded hover:bg-slate-100"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-8 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1 px-1">
        {HARI_HEADER.map((h) => <span key={h}>{h}</span>)}
        <span>Mgg</span>
      </div>

      <div className="space-y-1">
        {rowStarts.map((monday) => {
          const key_minggu = getISOWeekKey(monday);
          const isSelected = key_minggu === selectedKey;
          const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return d;
          });
          const saturday = days[5];
          const weekNum = key_minggu.match(/-W(\d+)$/)?.[1] ?? '';

          return (
            <button
              type="button"
              key={key_minggu}
              onClick={() => onSelectWeek({
                key_minggu,
                tanggal_mulai: toDateStr(monday),
                tanggal_selesai: toDateStr(saturday),
                label: `${monday.getDate()} ${BULAN_SHORT[monday.getMonth()]} – ${saturday.getDate()} ${BULAN_SHORT[saturday.getMonth()]}`,
              })}
              className={`grid grid-cols-8 gap-1 w-full text-center text-xs py-1.5 px-1 rounded-lg transition-colors ${
                isSelected ? 'bg-slate-700 text-white' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {days.map((d) => (
                <span key={d.toISOString()} className={d.getMonth() !== viewDate.getMonth() ? 'opacity-30' : ''}>
                  {d.getDate()}
                </span>
              ))}
              <span className="font-bold">W{weekNum}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
