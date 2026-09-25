'use client';

import { useState } from 'react';

interface MurojaahRow {
  id_murojaah?: string;
  surat_diulang: string;
  status_kelancaran: string;
  catatan_guru: string;
}

type SaveRow = (id_santri: string, data: MurojaahRow, id?: string) => Promise<void>;

type DeleteRow = (id: string, id_santri: string) => Promise<void>;

export function MurojaahTable({ santri, entries, onSaveRow, onDeleteRow, onImportPrevious, previousDateLabel }: { santri: { id_santri: string; nama: string }[]; entries: Record<string, MurojaahRow[]>; onSaveRow: SaveRow; onDeleteRow: DeleteRow; onImportPrevious: () => Promise<void>; previousDateLabel: string }) {
  return <div><div className="mb-4"><button type="button" onClick={() => void onImportPrevious()} className="btn-3d px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-bold">Ambil dari {previousDateLabel}</button><p className="text-xs text-slate-500 mt-2">Menyalin Murojaah berstatus Cukup Lancar dan Perlu Diulang</p></div><div className="overflow-x-auto"><table className="w-full text-sm border-collapse min-w-[720px]"><thead className="sticky top-0 bg-white z-10"><tr className="border-b-2 border-border"><th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Santri</th><th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Surat Diulang</th><th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Kelancaran</th><th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Catatan</th><th /></tr></thead><tbody>{santri.map((student) => <MurojaahStudent key={student.id_santri} student={student} initialRows={entries[student.id_santri] ?? []} onSaveRow={onSaveRow} onDeleteRow={onDeleteRow} />)}</tbody></table></div></div>;
}

function MurojaahStudent({ student, initialRows, onSaveRow, onDeleteRow }: { student: { id_santri: string; nama: string }; initialRows: MurojaahRow[]; onSaveRow: SaveRow; onDeleteRow: DeleteRow }) {
  const [rows, setRows] = useState<MurojaahRow[]>(initialRows.length ? initialRows : [{ surat_diulang: '', status_kelancaran: '', catatan_guru: '' }]);
  const update = (index: number, patch: Partial<MurojaahRow>) => {
    const next = { ...rows[index], ...patch };
    setRows((current) => current.map((item, i) => i === index ? next : item));
    void onSaveRow(student.id_santri, next, next.id_murojaah);
  };
  const remove = async (index: number) => {
    const row = rows[index];
    if (row.id_murojaah) await onDeleteRow(row.id_murojaah, student.id_santri);
    setRows((current) => current.length === 1 ? [{ surat_diulang: '', status_kelancaran: '', catatan_guru: '' }] : current.filter((_, i) => i !== index));
  };
  return <>{rows.map((row, index) => <tr key={row.id_murojaah ?? `${student.id_santri}-${index}`} className="border-b border-border"><td className="py-2 pr-4 font-semibold text-slate-700">{index === 0 ? student.nama : ''}</td><td className="py-2 pr-4"><input value={row.surat_diulang} onChange={(e) => update(index, { surat_diulang: e.target.value })} className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2" /></td><td className="py-2 pr-4"><select value={row.status_kelancaran} onChange={(e) => update(index, { status_kelancaran: e.target.value })} className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2"><option value="" /><option>Lancar</option><option>Cukup Lancar</option><option>Perlu Diulang</option></select></td><td className="py-2 pr-4"><input value={row.catatan_guru} onChange={(e) => update(index, { catatan_guru: e.target.value })} className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2" /></td><td className="py-2 whitespace-nowrap"><button type="button" onClick={() => setRows((current) => [...current, { surat_diulang: '', status_kelancaran: '', catatan_guru: '' }])} className="text-xs font-bold text-emerald-600 mr-3">+ Surah</button><button type="button" onClick={() => void remove(index)} className="text-xs font-bold text-red-600">Hapus</button></td></tr>)}</>;
}
