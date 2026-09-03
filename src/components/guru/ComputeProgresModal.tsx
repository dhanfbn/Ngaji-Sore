'use client';

import { useState } from 'react';

interface ComputeProgresModalProps {
  weekLabel: string;
  weekKey: string;
  onCancel: () => void;
  onConfirm: (mode: 'selected' | 'all') => void;
}

export function ComputeProgresModal({ weekLabel, weekKey, onCancel, onConfirm }: ComputeProgresModalProps) {
  const [mode, setMode] = useState<'selected' | 'all'>('selected');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="card-3d bg-white rounded-3xl p-6 max-w-md w-full">
        <h2 className="font-bold text-slate-800 font-poppins text-lg mb-1">Hitung Progres Mingguan</h2>
        <p className="text-sm text-slate-500 font-nunito mb-4">Pilih cakupan minggu yang mau dihitung ulang.</p>

        <div className="space-y-2">
          <label
            className={`flex items-start gap-3 rounded-xl border-2 p-3 cursor-pointer ${
              mode === 'selected' ? 'border-brand-green bg-slate-50' : 'border-transparent bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="compute-progres-mode"
              className="mt-1"
              checked={mode === 'selected'}
              onChange={() => setMode('selected')}
            />
            <span>
              <span className="block font-bold text-sm text-slate-700 font-nunito">Hanya minggu terpilih</span>
              <span className="block text-xs text-slate-500 font-nunito">Minggu {weekKey} · {weekLabel}</span>
            </span>
          </label>

          <label
            className={`flex items-start gap-3 rounded-xl border-2 p-3 cursor-pointer ${
              mode === 'all' ? 'border-brand-green bg-slate-50' : 'border-transparent bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="compute-progres-mode"
              className="mt-1"
              checked={mode === 'all'}
              onChange={() => setMode('all')}
            />
            <span>
              <span className="block font-bold text-sm text-slate-700 font-nunito">Hitung ulang seluruh minggu</span>
              <span className="block text-xs text-slate-500 font-nunito">
                Proses semua minggu yang punya lesson plan di kelas ini. Bisa memakan waktu lebih lama.
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 h-10 font-nunito font-bold text-sm text-slate-500 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(mode)}
            className="btn-3d rounded-xl px-4 h-10 font-nunito font-bold text-sm bg-brand-green text-white"
          >
            Hitung
          </button>
        </div>
      </div>
    </div>
  );
}
