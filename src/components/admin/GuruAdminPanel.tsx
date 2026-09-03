'use client';

import { useEffect, useState } from 'react';
import { DebouncedField } from '@/components/shared/DebouncedField';

interface Guru {
  id_guru: string;
  nama_guru: string;
  no_hp: string | null;
  status_guru: string;
}

const STATUS_OPTIONS = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'nonaktif', label: 'Nonaktif' },
];

async function saveGuru(payload: Record<string, string>) {
  const res = await fetch('/api/admin/guru', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal menyimpan');
}

function GuruRow({ row, onFieldSaved }: { row: Guru; onFieldSaved: (field: keyof Guru, value: string) => void }) {
  const [pw, setPw] = useState('');
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  const handleSetPassword = async () => {
    if (!pw) return;
    setPwStatus('saving');
    try {
      await saveGuru({ id_guru: row.id_guru, nama_guru: row.nama_guru, no_hp: row.no_hp ?? '', status_guru: row.status_guru, password: pw });
      setPwStatus('done');
      setPw('');
      setTimeout(() => setPwStatus('idle'), 2000);
    } catch {
      setPwStatus('error');
    }
  };

  return (
    <tr className="border-b border-border last:border-0 hover:bg-slate-50/70">
      <td className="py-2 pr-4 font-semibold text-slate-700 whitespace-nowrap">{row.id_guru}</td>
      <td className="py-2 pr-4">
        <DebouncedField
          value={row.nama_guru}
          onSave={async (v) => { await saveGuru({ id_guru: row.id_guru, nama_guru: v, no_hp: row.no_hp ?? '', status_guru: row.status_guru }); onFieldSaved('nama_guru', v); }}
        />
      </td>
      <td className="py-2 pr-4">
        <DebouncedField
          value={row.no_hp ?? ''}
          onSave={async (v) => { await saveGuru({ id_guru: row.id_guru, nama_guru: row.nama_guru, no_hp: v, status_guru: row.status_guru }); onFieldSaved('no_hp', v); }}
        />
      </td>
      <td className="py-2 pr-4 w-32">
        <DebouncedField
          type="select"
          options={STATUS_OPTIONS}
          value={row.status_guru}
          onSave={async (v) => { await saveGuru({ id_guru: row.id_guru, nama_guru: row.nama_guru, no_hp: row.no_hp ?? '', status_guru: v }); onFieldSaved('status_guru', v); }}
        />
      </td>
      <td className="py-2 pr-4 w-56">
        <div className="flex gap-1">
          <input
            type="password"
            placeholder="Password baru"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2"
          />
          <button
            onClick={handleSetPassword}
            className="h-9 px-3 rounded-lg bg-slate-700 text-white text-xs font-bold whitespace-nowrap"
          >
            {pwStatus === 'saving' ? '...' : pwStatus === 'done' ? 'OK' : 'Set'}
          </button>
        </div>
      </td>
    </tr>
  );
}

export function GuruAdminPanel() {
  const [list, setList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id_guru: '', nama_guru: '', no_hp: '', status_guru: 'aktif', password: '' });
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  const load = () => {
    fetch('/api/admin/guru')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setList(json.guru);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSaving(true);
    try {
      await saveGuru(form);
      setForm({ id_guru: '', nama_guru: '', no_hp: '', status_guru: 'aktif', password: '' });
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setFormSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="card-3d bg-white rounded-3xl p-4 sm:p-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ID Guru</label>
          <input required value={form.id_guru} onChange={(e) => setForm({ ...form, id_guru: e.target.value.toUpperCase() })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-32" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nama</label>
          <input required value={form.nama_guru} onChange={(e) => setForm({ ...form, nama_guru: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-48" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">No HP</label>
          <input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-36" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Status</label>
          <select value={form.status_guru} onChange={(e) => setForm({ ...form, status_guru: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Password Awal</label>
          <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-40" />
        </div>
        <button type="submit" disabled={formSaving} className="btn-3d h-9 px-4 rounded-lg bg-slate-700 text-white text-sm font-bold disabled:opacity-50">
          {formSaving ? 'Menyimpan...' : 'Tambah Guru'}
        </button>
        {formError && <p className="text-xs text-red-500 w-full">{formError}</p>}
      </form>

      <div className="card-3d bg-white rounded-3xl overflow-hidden p-4 sm:p-6">
        {loading ? (
          <p className="text-sm text-slate-400 font-nunito py-8 text-center">Memuat...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">ID</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Nama</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">No HP</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Status</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Reset Password</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <GuruRow
                    key={row.id_guru}
                    row={row}
                    onFieldSaved={(field, value) => setList((prev) => prev.map((g) => (g.id_guru === row.id_guru ? { ...g, [field]: value } : g)))}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
