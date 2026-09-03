'use client';

import { useEffect, useState } from 'react';
import { DebouncedField } from '@/components/shared/DebouncedField';

interface Santri {
  id_santri: string;
  nama: string;
  gender: string | null;
  tanggal_lahir: string;
  id_kelas: string | null;
  ayah_ibu: string | null;
  no_hp: string | null;
  status_santri: string | null;
  periode_belajar: string | null;
}

interface KelasOption {
  id_kelas: string;
  nama_kelas: string | null;
}

const GENDER_OPTIONS = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
];

async function saveSantri(payload: Record<string, string>) {
  const res = await fetch('/api/admin/santri', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal menyimpan');
}

function SantriRow({ row, kelasOptions, onFieldSaved }: { row: Santri; kelasOptions: KelasOption[]; onFieldSaved: (field: keyof Santri, value: string) => void }) {
  const base = {
    id_santri: row.id_santri,
    nama: row.nama,
    gender: row.gender ?? '',
    tanggal_lahir: row.tanggal_lahir,
    id_kelas: row.id_kelas ?? '',
    ayah_ibu: row.ayah_ibu ?? '',
    no_hp: row.no_hp ?? '',
    status_santri: row.status_santri ?? '',
    periode_belajar: row.periode_belajar ?? '',
  };
  const kelasSelectOptions = kelasOptions.map((k) => ({ value: k.id_kelas, label: k.nama_kelas ?? k.id_kelas }));

  return (
    <tr className="border-b border-border last:border-0 hover:bg-slate-50/70">
      <td className="py-2 pr-4 font-semibold text-slate-700 whitespace-nowrap">{row.id_santri}</td>
      <td className="py-2 pr-4">
        <DebouncedField value={base.nama} onSave={async (v) => { await saveSantri({ ...base, nama: v }); onFieldSaved('nama', v); }} />
      </td>
      <td className="py-2 pr-4 w-32">
        <DebouncedField type="select" options={GENDER_OPTIONS} value={base.gender} onSave={async (v) => { await saveSantri({ ...base, gender: v }); onFieldSaved('gender', v); }} />
      </td>
      <td className="py-2 pr-4 w-40">
        <DebouncedField type="date" value={base.tanggal_lahir} onSave={async (v) => { await saveSantri({ ...base, tanggal_lahir: v }); onFieldSaved('tanggal_lahir', v); }} />
      </td>
      <td className="py-2 pr-4 w-40">
        <DebouncedField type="select" options={kelasSelectOptions} value={base.id_kelas} onSave={async (v) => { await saveSantri({ ...base, id_kelas: v }); onFieldSaved('id_kelas', v); }} />
      </td>
      <td className="py-2 pr-4">
        <DebouncedField value={base.ayah_ibu} onSave={async (v) => { await saveSantri({ ...base, ayah_ibu: v }); onFieldSaved('ayah_ibu', v); }} />
      </td>
      <td className="py-2 pr-4">
        <DebouncedField value={base.no_hp} onSave={async (v) => { await saveSantri({ ...base, no_hp: v }); onFieldSaved('no_hp', v); }} />
      </td>
      <td className="py-2 pr-4">
        <DebouncedField value={base.status_santri} onSave={async (v) => { await saveSantri({ ...base, status_santri: v }); onFieldSaved('status_santri', v); }} />
      </td>
    </tr>
  );
}

export function SantriAdminPanel() {
  const [list, setList] = useState<Santri[]>([]);
  const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id_santri: '', nama: '', gender: '', tanggal_lahir: '', id_kelas: '', ayah_ibu: '', no_hp: '', status_santri: 'aktif', periode_belajar: '' });
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  const load = () => {
    Promise.all([
      fetch('/api/admin/santri').then((r) => r.json()),
      fetch('/api/admin/kelas').then((r) => r.json()),
    ]).then(([santriJson, kelasJson]) => {
      if (santriJson.success) setList(santriJson.santri);
      if (kelasJson.success) setKelasOptions(kelasJson.kelas);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSaving(true);
    try {
      await saveSantri(form);
      setForm({ id_santri: '', nama: '', gender: '', tanggal_lahir: '', id_kelas: '', ayah_ibu: '', no_hp: '', status_santri: 'aktif', periode_belajar: '' });
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
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ID Santri</label>
          <input required value={form.id_santri} onChange={(e) => setForm({ ...form, id_santri: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-32" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nama</label>
          <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-48" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Gender</label>
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2">
            <option value="" />
            {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Tanggal Lahir</label>
          <input required type="date" value={form.tanggal_lahir} onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Kelas</label>
          <select value={form.id_kelas} onChange={(e) => setForm({ ...form, id_kelas: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-40">
            <option value="" />
            {kelasOptions.map((k) => <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas ?? k.id_kelas}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Ayah/Ibu</label>
          <input value={form.ayah_ibu} onChange={(e) => setForm({ ...form, ayah_ibu: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-40" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">No HP</label>
          <input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-36" />
        </div>
        <button type="submit" disabled={formSaving} className="btn-3d h-9 px-4 rounded-lg bg-slate-700 text-white text-sm font-bold disabled:opacity-50">
          {formSaving ? 'Menyimpan...' : 'Tambah Santri'}
        </button>
        {formError && <p className="text-xs text-red-500 w-full">{formError}</p>}
      </form>

      <div className="card-3d bg-white rounded-3xl overflow-hidden p-4 sm:p-6">
        {loading ? (
          <p className="text-sm text-slate-400 font-nunito py-8 text-center">Memuat...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[960px]">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">ID</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Nama</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Gender</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Tgl Lahir</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Kelas</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Ayah/Ibu</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">No HP</th>
                  <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <SantriRow
                    key={row.id_santri}
                    row={row}
                    kelasOptions={kelasOptions}
                    onFieldSaved={(field, value) => setList((prev) => prev.map((s) => (s.id_santri === row.id_santri ? { ...s, [field]: value } : s)))}
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
