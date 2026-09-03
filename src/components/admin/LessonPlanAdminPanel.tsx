'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { MonthWeekCalendar, type WeekSelection } from './MonthWeekCalendar';

interface KelasOption {
  id_kelas: string;
  nama_kelas: string | null;
}

interface Row {
  id?: number;
  hari: string;
  kategori: string;
  materi: string;
}

const HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const EMPTY_ROW: Row = { hari: 'Senin', kategori: '', materi: '' };

export function LessonPlanAdminPanel() {
  const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [week, setWeek] = useState<WeekSelection | null>(null);
  const [temaMinggu, setTemaMinggu] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/admin/kelas').then((r) => r.json()).then((json) => {
      if (json.success) setKelasOptions(json.kelas);
    });
  }, []);

  const handleSelectWeek = async (kelas: string, picked: WeekSelection) => {
    setWeek(picked);
    setLoaded(false);
    if (!kelas) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/lesson-plan?id_kelas=${encodeURIComponent(kelas)}&key_minggu=${encodeURIComponent(picked.key_minggu)}`);
      const json = await res.json();
      if (json.success) {
        if (json.rows.length > 0) {
          setTemaMinggu(json.rows[0].tema_minggu);
          setRows(json.rows.map((r: Row) => ({ id: r.id, hari: r.hari, kategori: r.kategori, materi: r.materi })));
        } else {
          setTemaMinggu('');
          setRows([{ ...EMPTY_ROW }]);
        }
        setLoaded(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (index: number, field: keyof Row, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!week) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_kelas: selectedKelas,
          key_minggu: week.key_minggu,
          tanggal_mulai: week.tanggal_mulai,
          tanggal_selesai: week.tanggal_selesai,
          tema_minggu: temaMinggu,
          rows,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ text: 'Tersimpan.', error: false });
        handleSelectWeek(selectedKelas, week);
      } else {
        setMessage({ text: json.message || 'Gagal menyimpan.', error: true });
      }
    } catch {
      setMessage({ text: 'Terjadi kesalahan jaringan.', error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card-3d bg-white rounded-3xl p-4 sm:p-6 space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Kelas</label>
          <select
            value={selectedKelas}
            onChange={(e) => { setSelectedKelas(e.target.value); setLoaded(false); if (week) handleSelectWeek(e.target.value, week); }}
            className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-48"
          >
            <option value="" />
            {kelasOptions.map((k) => <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas ?? k.id_kelas}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pilih Minggu</label>
          <MonthWeekCalendar
            selectedKey={week?.key_minggu}
            onSelectWeek={(picked) => handleSelectWeek(selectedKelas, picked)}
          />
          {week && (
            <p className="text-xs text-slate-500 font-nunito mt-2">
              Minggu terpilih: <span className="font-bold">{week.key_minggu}</span> ({week.label})
              {!selectedKelas && <span className="text-red-500"> — pilih kelas dulu</span>}
            </p>
          )}
        </div>

        {loading && <p className="text-xs text-slate-400">Memuat...</p>}
      </div>

      {loaded && (
        <div className="card-3d bg-white rounded-3xl p-4 sm:p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Tema Minggu</label>
            <input value={temaMinggu} onChange={(e) => setTemaMinggu(e.target.value)} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-full max-w-md" />
          </div>

          <div className="space-y-2">
            {rows.map((row, i) => (
              <div key={row.id ?? `new-${i}`} className="flex flex-wrap gap-2 items-center">
                <select value={row.hari} onChange={(e) => updateRow(i, 'hari', e.target.value)} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-28">
                  {HARI_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <input placeholder="Kategori (misal Ziyadah)" value={row.kategori} onChange={(e) => updateRow(i, 'kategori', e.target.value)} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-40" />
                <input placeholder="Materi" value={row.materi} onChange={(e) => updateRow(i, 'materi', e.target.value)} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 flex-1 min-w-[160px]" />
                <button onClick={() => removeRow(i)} className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Hapus baris dari daftar">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={addRow} className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-slate-800">
              <Plus className="w-4 h-4" /> Tambah Baris
            </button>
          </div>

          <button onClick={handleSave} disabled={saving || !selectedKelas} className="btn-3d h-10 px-6 rounded-lg bg-slate-700 text-white text-sm font-bold disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Semua'}
          </button>
          {message && <p className={`text-xs ${message.error ? 'text-red-500' : 'text-emerald-600'}`}>{message.text}</p>}
        </div>
      )}
    </div>
  );
}
