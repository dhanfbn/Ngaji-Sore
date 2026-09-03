'use client';

const TABS = [
  { key: 'guru', label: 'Guru' },
  { key: 'santri', label: 'Santri' },
  { key: 'kelas', label: 'Kelas' },
  { key: 'lesson-plan', label: 'Lesson Plan' },
] as const;

export type AdminTabKey = (typeof TABS)[number]['key'];

interface AdminTabsProps {
  active: AdminTabKey;
  onChange: (key: AdminTabKey) => void;
}

export function AdminTabs({ active, onChange }: AdminTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={
            active === t.key
              ? 'btn-3d rounded-2xl px-4 py-2 font-nunito font-bold text-sm bg-slate-700 text-white'
              : 'rounded-2xl px-4 py-2 font-nunito font-bold text-sm bg-white text-slate-500 border-2 border-transparent hover:border-slate-100 hover:bg-slate-50'
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
