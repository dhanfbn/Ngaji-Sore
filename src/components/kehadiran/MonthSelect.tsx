'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import type { MonthOption } from '@/types/dashboard';

interface MonthSelectProps {
  months: MonthOption[];
  selectedMonth: string;
}

export function MonthSelect({ months, selectedMonth }: MonthSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (months.length === 0) return null;

  const handleChange = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('bulan', key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="inline-flex items-center gap-2 bg-white border-2 border-slate-100 rounded-2xl px-4 py-2.5 shadow-sm shrink-0">
      <Calendar className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
      <select
        value={selectedMonth}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40 rounded cursor-pointer"
        aria-label="Pilih bulan"
      >
        {months.map(m => (
          <option key={m.key} value={m.key}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}
