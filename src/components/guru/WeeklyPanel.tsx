'use client';

import { useEffect, useState } from 'react';
import { EntryTable } from './EntryTable';
import type { CategoryConfig } from './entryColumns';

interface WeeklyPanelProps {
  category: CategoryConfig;
  id_kelas: string;
  key_minggu: string;
}

export function WeeklyPanel({ category, id_kelas, key_minggu }: WeeklyPanelProps) {
  const [loadedKey, setLoadedKey] = useState('');
  const [santri, setSantri] = useState<{ id_santri: string; nama: string }[]>([]);
  const [entries, setEntries] = useState<Record<string, Record<string, unknown>>>({});

  const dataKey = `${id_kelas}|${category.key}|${key_minggu}`;
  const loading = !!id_kelas && !!key_minggu && loadedKey !== dataKey;

  useEffect(() => {
    if (!id_kelas || !key_minggu || loadedKey === dataKey) return;
    fetch(`/api/guru/entry?category=${category.key}&id_kelas=${encodeURIComponent(id_kelas)}&key_minggu=${encodeURIComponent(key_minggu)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setSantri(json.santri);
          setEntries(json.entries);
          setLoadedKey(dataKey);
        }
      });
  }, [id_kelas, key_minggu, dataKey, loadedKey, category.key]);

  const handleSaveRow = async (id_santri: string, rowData: Record<string, unknown>) => {
    const data = Object.fromEntries(category.columns.map((col) => [col.key, rowData[col.key]]));

    const res = await fetch('/api/guru/entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: category.key, id_santri, id_kelas, key_minggu, data }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Gagal menyimpan');
  };

  return (
    <div className="card-3d bg-white rounded-3xl overflow-hidden p-4 sm:p-6">
      {!id_kelas || !key_minggu ? (
        <p className="text-sm text-slate-400 font-nunito py-8 text-center">Pilih kelas dan minggu dulu.</p>
      ) : loading ? (
        <p className="text-sm text-slate-400 font-nunito py-8 text-center">Memuat...</p>
      ) : (
        <EntryTable
          columns={category.columns}
          santri={santri}
          entries={entries}
          onSaveRow={handleSaveRow}
          defaultRow={category.defaultRow}
        />
      )}
    </div>
  );
}
