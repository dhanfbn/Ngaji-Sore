'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { EntryTable } from './EntryTable';
import { formatFullDate } from '@/lib/weekDays';
import type { ColumnConfig, CategoryConfig } from './entryColumns';

interface DaySectionProps {
  category: CategoryConfig;
  id_kelas: string;
  key_minggu: string;
  hari: string;
  tanggal: string;
  defaultExpanded: boolean;
}

export function DaySection({ category, id_kelas, key_minggu, hari, tanggal, defaultExpanded }: DaySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [loadedKey, setLoadedKey] = useState('');
  const [santri, setSantri] = useState<{ id_santri: string; nama: string }[]>([]);
  const [entries, setEntries] = useState<Record<string, Record<string, unknown>>>({});
  const [masterSurah, setMasterSurah] = useState<{ id_surah: string; nama_surah: string; jumlah_ayat: number }[]>([]);

  const dataKey = `${id_kelas}|${category.key}|${tanggal}`;
  const loading = expanded && loadedKey !== dataKey;

  useEffect(() => {
    if (!expanded || loadedKey === dataKey) return;
    fetch(`/api/guru/entry?category=${category.key}&id_kelas=${encodeURIComponent(id_kelas)}&tanggal=${tanggal}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setSantri(json.santri);
          setEntries(json.entries);
          setMasterSurah(json.masterSurah ?? []);
          setLoadedKey(dataKey);
        }
      });
  }, [expanded, dataKey, loadedKey, category.key, id_kelas, tanggal]);

  const handleSaveRow = async (id_santri: string, rowData: Record<string, unknown>) => {
    const data: Record<string, unknown> =
      category.key === 'adab_harian'
        ? { Sopan: rowData.Sopan, Santun: rowData.Santun, Kedisiplinan: rowData.Kedisiplinan }
        : Object.fromEntries(category.columns.map((col: ColumnConfig) => [col.key, rowData[col.key]]));

    const res = await fetch('/api/guru/entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: category.key, id_santri, id_kelas, tanggal, key_minggu, data }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Gagal menyimpan');
  };

  const dynamicOptions =
    category.key === 'ziyadah'
      ? { id_surah: masterSurah.map((s) => ({ value: s.id_surah, label: `${s.id_surah}. ${s.nama_surah}`, meta: s.jumlah_ayat })) }
      : undefined;

  return (
    <div className="card-3d bg-white rounded-3xl overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 text-left"
      >
        <span className={`inline-block w-3 h-3 rounded-full ${expanded ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-hidden="true" />
        <h3 className="font-bold text-slate-800 font-poppins flex-1">{formatFullDate(hari, tanggal)}</h3>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {loading ? (
            <p className="text-sm text-slate-400 font-nunito py-8 text-center">Memuat...</p>
          ) : (
            <EntryTable
              columns={category.columns}
              santri={santri}
              entries={entries}
              onSaveRow={handleSaveRow}
              dynamicOptions={dynamicOptions}
              defaultRow={category.defaultRow}
            />
          )}
        </div>
      )}
    </div>
  );
}
