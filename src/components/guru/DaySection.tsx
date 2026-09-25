'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { EntryTable } from './EntryTable';
import { MurojaahTable } from './MurojaahTable';
import { formatFullDate } from '@/lib/weekDays';
import type { ColumnConfig, CategoryConfig } from './entryColumns';

interface DaySectionProps {
  category: CategoryConfig;
  id_kelas: string;
  key_minggu: string;
  hari: string;
  tanggal: string;
  defaultExpanded: boolean;
  defaultRow?: Record<string, string>;
}

export function DaySection({ category, id_kelas, key_minggu, hari, tanggal, defaultExpanded, defaultRow }: DaySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [loadedKey, setLoadedKey] = useState('');
  const [santri, setSantri] = useState<{ id_santri: string; nama: string }[]>([]);
  const [entries, setEntries] = useState<Record<string, Record<string, unknown> | Record<string, unknown>[]>>({});
  const [masterSurah, setMasterSurah] = useState<{ id_surah: string; nama_surah: string; jumlah_ayat: number }[]>([]);

  const dataKey = `${id_kelas}|${category.key}|${tanggal}`;
  const previousDate = new Date(`${tanggal}T00:00:00`);
  const day = previousDate.getDay();
  previousDate.setDate(previousDate.getDate() - (day === 1 ? 3 : 1));
  const previousDateValue = previousDate.toISOString().slice(0, 10);
  const previousDateLabel = previousDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const loading = expanded && loadedKey !== dataKey;

  const hasAdabColumns = category.key === 'kehadiran' && category.columns.some((col) => col.targetCategory === 'adab_harian');

  useEffect(() => {
    if (!expanded || loadedKey === dataKey) return;
    const qs = `id_kelas=${encodeURIComponent(id_kelas)}&tanggal=${tanggal}`;
    const fetchJson = (url: string) => fetch(url).then(async (response) => {
      if (!response.ok) throw new Error('Gagal memuat data');
      return response.json();
    });
    Promise.all([
      fetchJson(`/api/guru/entry?category=${category.key}&${qs}`),
      hasAdabColumns ? fetchJson(`/api/guru/entry?category=adab_harian&${qs}`) : null,
    ]).then(([json, adabJson]) => {
      if (!json.success) return;
      let entries = json.entries as Record<string, Record<string, unknown>>;
      if (hasAdabColumns && adabJson?.success) {
        entries = { ...entries };
        for (const [id_santri, adabRow] of Object.entries(adabJson.entries as Record<string, Record<string, unknown>>)) {
          entries[id_santri] = { ...entries[id_santri], ...adabRow };
        }
      }
      setSantri(json.santri);
      setEntries(entries);
      setMasterSurah(json.masterSurah ?? []);
      setLoadedKey(dataKey);
    });
  }, [expanded, dataKey, loadedKey, category.key, id_kelas, tanggal, hasAdabColumns]);

  const handleSaveRow = async (id_santri: string, rowData: Record<string, unknown>) => {
    const save = (cat: string, data: Record<string, unknown>) =>
      fetch('/api/guru/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat, id_santri, id_kelas, tanggal, key_minggu, data }),
      }).then((r) => r.json());

    const ownColumns = category.columns.filter((col: ColumnConfig) => !col.targetCategory);
    const data = Object.fromEntries(ownColumns.map((col) => [col.key, rowData[col.key]]));
    const results = await Promise.all([
      save(category.key, data),
      hasAdabColumns ? save('adab_harian', { Sopan: rowData.Sopan, Santun: rowData.Santun, Kedisiplinan: rowData.Kedisiplinan }) : null,
    ]);
    const failed = results.find((json) => json && !json.success);
    if (failed) throw new Error(failed.message || 'Gagal menyimpan');
  };

  const dynamicOptions =
    category.key === 'ziyadah'
      ? { id_surah: masterSurah.map((s) => ({ value: s.id_surah, label: `${s.id_surah}. ${s.nama_surah}`, meta: s.jumlah_ayat })) }
      : undefined;

  return (
    <div className="card-3d bg-white rounded-3xl overflow-hidden">
      <button
         onClick={() => {
           setExpanded((e) => {
             if (e) setLoadedKey('');
             return !e;
           });
         }}
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
          ) : category.key === 'murojaah' ? (
            <MurojaahTable santri={santri} entries={entries as Record<string, { id_murojaah?: string; surat_diulang: string; status_kelancaran: string; catatan_guru: string }[]>} onDeleteRow={async (id, id_santri) => {
              const response = await fetch('/api/guru/entry', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, id_santri, id_kelas }) });
              const json = await response.json();
              if (!json.success) throw new Error(json.message || 'Gagal menghapus');
            }} previousDateLabel={previousDateLabel} onImportPrevious={async () => {
              const response = await fetch(`/api/guru/entry?category=murojaah&id_kelas=${encodeURIComponent(id_kelas)}&tanggal=${previousDateValue}`);
              const json = await response.json();
              if (!json.success) throw new Error(json.message || 'Gagal mengambil data sebelumnya');
              const previousEntries = json.entries as Record<string, { surat_diulang: string; status_kelancaran: string; catatan_guru: string }[]>;
              await Promise.all(Object.entries(previousEntries).flatMap(([id_santri, rows]) => rows.filter((row) => ['Cukup Lancar', 'Perlu Diulang'].includes(row.status_kelancaran)).map((row) => fetch('/api/guru/entry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: 'murojaah', id_santri, id_kelas, tanggal, key_minggu, data: row }) }))));
              setLoadedKey('');
            }} onSaveRow={async (id_santri, data, id) => {
              const response = await fetch('/api/guru/entry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: 'murojaah', id, id_santri, id_kelas, tanggal, key_minggu, data }) });
              const json = await response.json();
              if (!json.success) throw new Error(json.message || 'Gagal menyimpan');
            }} />
          ) : (
            <EntryTable
              columns={category.columns}
              santri={santri}
              entries={entries as Record<string, Record<string, unknown>>}
              onSaveRow={handleSaveRow}
              dynamicOptions={dynamicOptions}
              defaultRow={defaultRow ?? category.defaultRow}
            />
          )}
        </div>
      )}
    </div>
  );
}
