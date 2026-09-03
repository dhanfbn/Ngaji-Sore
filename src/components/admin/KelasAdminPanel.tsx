'use client';

import { useEffect, useState } from 'react';
import { DebouncedField } from '@/components/shared/DebouncedField';

interface Kelas {
  id_kelas: string;
  nama_kelas: string | null;
  id_guru: string | null;
  jadwal_kelas: string | null;
  jam_masuk: string | null;
  jam_pulang: string | null;
}

interface GuruOption {
  id_guru: string;
  nama_guru: string;
}

async function saveKelas(payload: Record<string, string>) {
  const res = await fetch('/api/admin/kelas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal menyimpan');
}

function KelasRow({ row, guruOptions, onFieldSaved }: { row: Kelas; guruOptions: GuruOption[]; onFieldSaved: (field: keyof Kelas, value: string) => void }) {
  const base = { id_kelas: row.id_kelas, nama_kelas: row.nama_kelas ?? '', id_guru: row.id_guru ?? '', jadwal_kelas: row.jadwal_kelas ?? '', jam_masuk: row.jam_masuk ?? '', jam_pulang: row.jam_pulang ?? '' };
  const guruSelectOptions = guruOptions.map((g) => ({ value: g.id_guru, label: `${g.id_guru} — ${g.nama_guru}` }));

  return (
    <tr className="border-b border-border last:border-0 hover:bg-slate-50/70">
      <td className="py-2 pr-4 font-semibold text-slate-700 whitespace-nowrap">{row.id_kelas}</td>
      <td className="py-2 pr-4">
        <DebouncedField value={base.nama_kelas} onSave={async (v) => { await saveKelas({ ...base, nama_kelas: v }); onFieldSaved('nama_kelas', v); }} />
      </td>
      <td className="py-2 pr-4 w-48">
        <DebouncedField type="select" options={guruSelectOptions} value={base.id_guru} onSave={async (v) => { await saveKelas({ ...base, id_guru: v }); onFieldSaved('id_guru', v); }} />
      </td>
      <td className="py-2 pr-4">
        <DebouncedField value={base.jadwal_kelas} onSave={async (v) => { await saveKelas({ ...base, jadwal_kelas: v }); onFieldSaved('jadwal_kelas', v); }} />
      </td>
      <td className="py-2 pr-4 w-24">
        <DebouncedField type="time" value={base.jam_masuk} onSave={async (v) => { await saveKelas({ ...base, jam_masuk: v }); onFieldSaved('jam_masuk', v); }} />
      </td>
      <td className="py-2 pr-4 w-24">
        <DebouncedField type="time" value={base.jam_pulang} onSave={async (v) => { await saveKelas({ ...base, jam_pulang: v }); onFieldSaved('jam_pulang', v); }} />
      </td>
    </tr>
  );
}

export function KelasAdminPanel() {
  const [list, setList] = useState<Kelas[]>([]);
  const [guruOptions, setGuruOptions] = useState<GuruOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id_kelas: '', nama_kelas: '', id_guru: '', jadwal_kelas: '', jam_masuk: '', jam_pulang: '' });
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  const load = () => {
    Promise.all([
      fetch('/api/admin/kelas').then((r) => r.json()),
      fetch('/api/admin/guru').then((r) => r.json()),
    ]).then(([kelasJson, guruJson]) => {
      if (kelasJson.success) setList(kelasJson.kelas);
      if (guruJson.success) setGuruOptions(guruJson.guru);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSaving(true);
    try {
      await saveKelas(form);
      setForm({ id_kelas: '', nama_kelas: '', id_guru: '', jadwal_kelas: '', jam_masuk: '', jam_pulang: '' });
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
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ID Kelas</label>
          <input required value={form.id_kelas} onChange={(e) => setForm({ ...form, id_kelas: e.target.value.toUpperCase() })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-28" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nama Kelas</label>
          <input value={form.nama_kelas} onChange={(e) => setForm({ ...form, nama_kelas: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-40" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Guru Pengajar</label>
          <select value={form.id_guru} onChange={(e) => setForm({ ...form, id_guru: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-48">
            <option value="" />
            {guruOptions.map((g) => <option key={g.id_guru} value={g.id_guru}>{g.id_guru} — {g.nama_guru}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Jadwal</label>
          <input value={form.jadwal_kelas} onChange={(e) => setForm({ ...form, jadwal_kelas: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-36" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Jam Masuk</label>
          <input type="time" value={form.jam_masuk} onChange={(e) => setForm({ ...form, jam_masuk: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Jam Pulang</label>
          <input type="time" value={form.jam_pulang} onChange={(e) => setForm({ ...form, jam_pulang: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2" />
        </div>
        <button type="submit" disabled={formSaving} className="btn-3d h-9 px-4 rounded-lg bg-slate-700 text-white text-sm font-bold disabled:opacity-50">
          {formSaving ? 'Menyimpan...' : 'Tambah Kelas'}
        </button>
        {formError && <p className="text-xs text-red-500 w-full">{formError}</p>}
      </form>

      <div className="card-3d bg-white rounded-3xl overflow-hidden p-4 sm:p-6">
        {loading ? (
          <p className="text-sm text-slate-400 font-nunito py-8 text-center">Memuat...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[820px]">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">ID</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Nama</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Guru</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Jadwal</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Jam Masuk</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Jam Pulang</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <KelasRow
                    key={row.id_kelas}
                    row={row}
                    guruOptions={guruOptions}
                    onFieldSaved={(field, value) => setList((prev) => prev.map((k) => (k.id_kelas === row.id_kelas ? { ...k, [field]: value } : k)))}
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
