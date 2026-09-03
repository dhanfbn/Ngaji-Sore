'use client';

import { useState } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import type { ColumnConfig } from './entryColumns';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SelectOption {
  value: string;
  label: string;
  /** Numeric value to auto-fill into another field on select (see ColumnConfig.autofillTargetKey). */
  meta?: number;
}

interface EntryTableProps {
  columns: ColumnConfig[];
  santri: { id_santri: string; nama: string }[];
  entries: Record<string, Record<string, unknown>>;
  onSaveRow: (id_santri: string, rowData: Record<string, unknown>) => Promise<void>;
  /** Dynamic select options per column key (e.g. Ziyadah's "id_surah" from masterSurah). */
  dynamicOptions?: Record<string, SelectOption[]>;
  /** Prefilled for a santri with no existing row yet; saved values always override these. */
  defaultRow?: Record<string, string>;
}

function inputValue(v: unknown): string {
  if (v === undefined || v === null) return '';
  return String(v);
}

function StatusDot({ status }: { status: SaveStatus }) {
  const color = {
    idle: 'bg-slate-200',
    saving: 'bg-amber-400 animate-pulse',
    saved: 'bg-emerald-500',
    error: 'bg-red-500',
  }[status];
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} aria-hidden="true" />;
}

function EntryRow({
  santriRow,
  columns,
  initialData,
  onSaveRow,
  dynamicOptions,
}: {
  santriRow: { id_santri: string; nama: string };
  columns: ColumnConfig[];
  initialData: Record<string, unknown>;
  onSaveRow: EntryTableProps['onSaveRow'];
  dynamicOptions?: Record<string, SelectOption[]>;
}) {
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [status, setStatus] = useState<SaveStatus>('idle');

  const debouncedSave = useDebouncedCallback(async (next: Record<string, unknown>) => {
    setStatus('saving');
    try {
      await onSaveRow(santriRow.id_santri, next);
      setStatus('saved');
      setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 2000);
    } catch {
      setStatus('error');
    }
  }, 800);

  const handleChange = (col: ColumnConfig, value: string) => {
    const next: Record<string, unknown> = { ...data, [col.key]: value };
    if (col.autofillTargetKey) {
      const option = dynamicOptions?.[col.key]?.find((o) => o.value === value);
      if (option?.meta !== undefined) next[col.autofillTargetKey] = option.meta;
    }
    setData(next);
    debouncedSave(next);
  };

  return (
    <tr className="border-b border-border last:border-0 hover:bg-slate-50/70">
      <td className="py-2 pr-4 sticky left-0 bg-white font-semibold text-slate-700 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          {santriRow.nama}
        </div>
      </td>
      {columns.map((col) => (
        <td key={col.key} className={`py-2 pr-4 ${col.width ?? ''}`}>
          {col.type === 'select' ? (
            <select
              value={inputValue(data[col.key])}
              onChange={(e) => handleChange(col, e.target.value)}
              className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 focus:bg-white focus:border-green-400"
            >
              <option value="" />
              {(dynamicOptions?.[col.key] ?? col.options?.map((o) => ({ value: o, label: o })) ?? []).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : col.type === 'textarea' ? (
            <textarea
              rows={2}
              value={inputValue(data[col.key])}
              onChange={(e) => handleChange(col, e.target.value)}
              className="w-full rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 py-1.5 focus:bg-white focus:border-green-400 resize-y"
            />
          ) : (
            <input
              type={col.type === 'number' ? 'number' : col.type === 'time' ? 'time' : 'text'}
              value={inputValue(data[col.key])}
              onChange={(e) => handleChange(col, e.target.value)}
              className="w-full h-9 rounded-lg bg-slate-50 border border-slate-200 text-sm px-2 focus:bg-white focus:border-green-400"
            />
          )}
        </td>
      ))}
    </tr>
  );
}

export function EntryTable({ columns, santri, entries, onSaveRow, dynamicOptions, defaultRow }: EntryTableProps) {
  if (santri.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-3xl mb-2">🍃</p>
        <p className="text-sm font-semibold text-slate-400">Belum ada santri di kelas ini.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-auto custom-scrollbar max-h-[70vh]">
      <table className="w-full text-sm border-collapse min-w-[720px]">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b-2 border-border">
            <th className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4 sticky left-0 bg-white">Santri</th>
            {columns.map((col) => (
              <th key={col.key} className="text-left font-bold text-muted-foreground text-xs uppercase tracking-wide py-3 pr-4">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {santri.map((s) => (
            <EntryRow
              key={s.id_santri}
              santriRow={s}
              columns={columns}
              initialData={{ ...defaultRow, ...entries[s.id_santri] }}
              onSaveRow={onSaveRow}
              dynamicOptions={dynamicOptions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
