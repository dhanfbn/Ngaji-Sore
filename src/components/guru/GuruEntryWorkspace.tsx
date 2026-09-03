'use client';

import { useEffect, useState } from 'react';
import { Calculator } from 'lucide-react';
import { GuruTabs } from './GuruTabs';
import { DaySection } from './DaySection';
import { WeeklyPanel } from './WeeklyPanel';
import { TugasRumahPanel } from './TugasRumahPanel';
import { GuruLogoutButton } from './LogoutButton';
import { CATEGORIES } from './entryColumns';
import { getDaysInWeek, todayDateStr } from '@/lib/weekDays';

type ComputeStatus = 'idle' | 'loading' | 'done' | 'error';

interface Kelas {
  id_kelas: string;
  nama_kelas: string | null;
}

interface Week {
  key: string;
  label: string;
  tanggal_mulai: string | null;
}

interface GuruEntryWorkspaceProps {
  guruNama: string;
  kelasList: Kelas[];
}

export function GuruEntryWorkspace({ guruNama, kelasList }: GuruEntryWorkspaceProps) {
  const [selectedKelas, setSelectedKelas] = useState(kelasList[0]?.id_kelas ?? '');
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeekKey, setSelectedWeekKey] = useState('');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const [computeStatus, setComputeStatus] = useState<ComputeStatus>('idle');
  const [computeMessage, setComputeMessage] = useState('');

  const selectedWeek = weeks.find((w) => w.key === selectedWeekKey);
  const days = selectedWeek?.tanggal_mulai ? getDaysInWeek(selectedWeek.tanggal_mulai) : [];

  // Fetch weeks when kelas changes.
  useEffect(() => {
    if (!selectedKelas) return;
    fetch(`/api/guru/weeks?id_kelas=${encodeURIComponent(selectedKelas)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setWeeks(json.weeks);
          setSelectedWeekKey(json.weeks[0]?.key ?? '');
        }
      });
  }, [selectedKelas]);

  const handleComputeProgres = async () => {
    if (!selectedKelas || !selectedWeekKey) return;
    setComputeStatus('loading');
    setComputeMessage('');
    try {
      const res = await fetch('/api/guru/compute-progres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_kelas: selectedKelas, key_minggu: selectedWeekKey }),
      });
      const json = await res.json();
      if (json.success) {
        setComputeStatus('done');
        setComputeMessage(`Progres ${json.updated} santri berhasil dihitung ulang.`);
      } else {
        setComputeStatus('error');
        setComputeMessage(json.message || 'Gagal menghitung progres.');
      }
    } catch {
      setComputeStatus('error');
      setComputeMessage('Terjadi kesalahan jaringan.');
    }
  };

  const category = CATEGORIES.find((c) => c.key === activeCategory)!;
  const today = todayDateStr();
  const defaultOpenTanggal = days.find((d) => d.tanggal === today)?.tanggal ?? days[0]?.tanggal;

  if (kelasList.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white px-4 text-center">
        <p className="text-slate-500 font-nunito mb-6">Kamu belum ditugaskan ke kelas manapun, hubungi admin.</p>
        <GuruLogoutButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] p-4 sm:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800 font-poppins">Entry Data — {guruNama}</h1>
          <GuruLogoutButton />
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="h-10 rounded-xl bg-white border border-slate-200 px-3 text-sm font-nunito"
          >
            {kelasList.map((k) => (
              <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas ?? k.id_kelas}</option>
            ))}
          </select>
          <select
            value={selectedWeekKey}
            onChange={(e) => setSelectedWeekKey(e.target.value)}
            className="h-10 rounded-xl bg-white border border-slate-200 px-3 text-sm font-nunito"
          >
            {weeks.length === 0 && <option value="">Belum ada minggu</option>}
            {weeks.map((w) => (
              <option key={w.key} value={w.key}>{w.label}</option>
            ))}
          </select>
          <button
            onClick={handleComputeProgres}
            disabled={!selectedWeekKey || computeStatus === 'loading'}
            className="btn-3d flex items-center gap-2 h-10 rounded-xl px-4 bg-slate-700 text-white text-sm font-nunito font-bold disabled:opacity-50"
          >
            <Calculator className="w-4 h-4" />
            {computeStatus === 'loading' ? 'Menghitung...' : 'Hitung Progres Mingguan'}
          </button>
        </div>

        {computeMessage && (
          <p className={`text-xs font-nunito mb-4 ${computeStatus === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
            {computeMessage}
          </p>
        )}

        <GuruTabs active={activeCategory} onChange={(k) => setActiveCategory(k as typeof activeCategory)} />

        <div className="mt-4 space-y-4">
          {activeCategory === 'tugas_rumah' ? (
            <TugasRumahPanel
              key={`${selectedKelas}-${selectedWeekKey}`}
              id_kelas={selectedKelas}
              key_minggu={selectedWeekKey}
            />
          ) : category.granularity === 'weekly' ? (
            <WeeklyPanel
              key={`${activeCategory}-${selectedKelas}-${selectedWeekKey}`}
              category={category}
              id_kelas={selectedKelas}
              key_minggu={selectedWeekKey}
            />
          ) : days.length === 0 ? (
            <div className="card-3d bg-white rounded-3xl p-8 text-center">
              <p className="text-sm text-slate-400 font-nunito">Pilih kelas dan minggu dulu.</p>
            </div>
          ) : (
            days.map((d) => (
              <DaySection
                key={`${activeCategory}-${selectedKelas}-${d.tanggal}`}
                category={category}
                id_kelas={selectedKelas}
                key_minggu={selectedWeekKey}
                hari={d.hari}
                tanggal={d.tanggal}
                defaultExpanded={d.tanggal === defaultOpenTanggal}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
