'use client';

import { useState } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface Option {
  value: string;
  label: string;
}

interface DebouncedFieldProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: 'text' | 'number' | 'date' | 'time' | 'select';
  options?: Option[];
  placeholder?: string;
  className?: string;
}

export function DebouncedField({ value: initialValue, onSave, type = 'text', options, placeholder, className }: DebouncedFieldProps) {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<SaveStatus>('idle');

  const debouncedSave = useDebouncedCallback(async (v: string) => {
    setStatus('saving');
    try {
      await onSave(v);
      setStatus('saved');
      setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 2000);
    } catch {
      setStatus('error');
    }
  }, 800);

  const handleChange = (v: string) => {
    setValue(v);
    debouncedSave(v);
  };

  const borderColor =
    status === 'error' ? 'border-red-300' : status === 'saved' ? 'border-emerald-300' : 'border-slate-200';

  const baseClass = `w-full h-9 rounded-lg bg-slate-50 border ${borderColor} text-sm px-2 focus:bg-white focus:border-green-400 ${className ?? ''}`;

  if (type === 'select') {
    return (
      <select value={value} onChange={(e) => handleChange(e.target.value)} className={baseClass}>
        <option value="" />
        {options?.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => handleChange(e.target.value)}
      className={baseClass}
    />
  );
}
