'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

interface Task {
  id?: string;
  deskripsi_tugas: string;
  status: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const STATUS_OPTIONS = ['Belum', 'Selesai'];

function StatusDot({ status }: { status: SaveStatus }) {
  const color = {
    idle: 'bg-slate-200',
    saving: 'bg-amber-400 animate-pulse',
    saved: 'bg-emerald-500',
    error: 'bg-red-500',
  }[status];
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${color}`} aria-hidden="true" />;
}

function TaskRow({
  id_santri,
  id_kelas,
  key_minggu,
  task,
}: {
  id_santri: string;
  id_kelas: string;
  key_minggu: string;
  task: Task;
}) {
  const [local, setLocal] = useState(task);
  const [taskId, setTaskId] = useState(task.id);
  const [status, setStatus] = useState<SaveStatus>('idle');

  const debouncedSave = useDebouncedCallback(async (next: Task) => {
    setStatus('saving');
    try {
      const res = await fetch('/api/guru/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'tugas_rumah',
          id_santri, id_kelas, key_minggu,
          id: taskId,
          data: { deskripsi_tugas: next.deskripsi_tugas, status: next.status },
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Gagal menyimpan');
      if (json.id && !taskId) setTaskId(json.id);
      setStatus('saved');
      setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 2000);
    } catch {
      setStatus('error');
    }
  }, 800);

  const handleChange = (field: keyof Task, value: string) => {
    const next = { ...local, [field]: value };
    setLocal(next);
    debouncedSave(next);
  };

  return (
    <div className="flex gap-2 items-center">
      <StatusDot status={status} />
      <input
        placeholder="Deskripsi tugas"
        value={local.deskripsi_tugas}
        onChange={(e) => handleChange('deskripsi_tugas', e.target.value)}
        className="flex-1 h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 focus:bg-white focus:border-green-400"
      />
      <select
        value={local.status}
        onChange={(e) => handleChange('status', e.target.value)}
        className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 w-32"
      >
        <option value="" />
        {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

interface TugasRumahPanelProps {
  id_kelas: string;
  key_minggu: string;
}

export function TugasRumahPanel({ id_kelas, key_minggu }: TugasRumahPanelProps) {
  const [loadedKey, setLoadedKey] = useState('');
  const [santri, setSantri] = useState<{ id_santri: string; nama: string }[]>([]);
  const [tasksBySantri, setTasksBySantri] = useState<Record<string, Task[]>>({});

  const dataKey = `${id_kelas}|${key_minggu}`;
  const loading = !!id_kelas && !!key_minggu && loadedKey !== dataKey;

  useEffect(() => {
    if (!id_kelas || !key_minggu || loadedKey === dataKey) return;
    fetch(`/api/guru/entry?category=tugas_rumah&id_kelas=${encodeURIComponent(id_kelas)}&key_minggu=${encodeURIComponent(key_minggu)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setSantri(json.santri);
          setTasksBySantri(json.entries ?? {});
          setLoadedKey(dataKey);
        }
      });
  }, [id_kelas, key_minggu, dataKey, loadedKey]);

  const addTask = (id_santri: string) => {
    setTasksBySantri((prev) => ({
      ...prev,
      [id_santri]: [...(prev[id_santri] ?? []), { deskripsi_tugas: '', status: 'Belum' }],
    }));
  };

  if (!id_kelas || !key_minggu) {
    return (
      <div className="card-3d bg-white rounded-3xl overflow-hidden p-4 sm:p-6">
        <p className="text-sm text-slate-400 font-nunito py-8 text-center">Pilih kelas dan minggu dulu.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card-3d bg-white rounded-3xl overflow-hidden p-4 sm:p-6">
        <p className="text-sm text-slate-400 font-nunito py-8 text-center">Memuat...</p>
      </div>
    );
  }

  if (santri.length === 0) {
    return (
      <div className="card-3d bg-white rounded-3xl overflow-hidden p-4 sm:p-6">
        <p className="text-sm text-slate-400 font-nunito py-8 text-center">Belum ada santri di kelas ini.</p>
      </div>
    );
  }

  return (
    <div className="card-3d bg-white rounded-3xl overflow-hidden p-4 sm:p-6 space-y-5">
      {santri.map((s) => {
        const tasks = tasksBySantri[s.id_santri] ?? [];
        return (
          <div key={s.id_santri} className="space-y-2">
            <h4 className="font-bold text-slate-700 text-sm">{s.nama}</h4>
            <div className="space-y-2 pl-1">
              {tasks.map((task, i) => (
                <TaskRow
                  key={task.id ?? `new-${s.id_santri}-${i}`}
                  id_santri={s.id_santri}
                  id_kelas={id_kelas}
                  key_minggu={key_minggu}
                  task={task}
                />
              ))}
              <button
                type="button"
                onClick={() => addTask(s.id_santri)}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Tugas
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
