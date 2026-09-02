'use client';

import { CATEGORIES } from './entryColumns';

interface GuruTabsProps {
  active: string;
  onChange: (key: string) => void;
}

export function GuruTabs({ active, onChange }: GuruTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => (
        <button
          key={c.key}
          onClick={() => onChange(c.key)}
          className={
            active === c.key
              ? 'btn-3d rounded-2xl px-4 py-2 font-nunito font-bold text-sm bg-brand-green text-white'
              : 'rounded-2xl px-4 py-2 font-nunito font-bold text-sm bg-white text-slate-500 border-2 border-transparent hover:border-slate-100 hover:bg-slate-50'
          }
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
