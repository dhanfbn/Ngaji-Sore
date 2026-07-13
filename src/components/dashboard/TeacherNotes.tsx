import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CatatanAnakRow } from '@/types/database';

// ── Note entry ─────────────────────────────────────────────────
function NoteEntry({ note, index }: { note: CatatanAnakRow; index: number }) {
  // Alternate soft background colours for visual variety
  const bgs = ['bg-yellow-50 border-yellow-200', 'bg-sky-50 border-sky-200', 'bg-violet-50 border-violet-200'];
  const pins = ['📌', '📍', '🔖'];
  const bg = bgs[index % bgs.length];
  const pin = pins[index % pins.length];

  return (
    <article className={`relative rounded-2xl border p-4 shadow-sm ${bg}`}>
      {/* Pin emoji top-right */}
      <span
        className="absolute -top-2 -right-1 text-lg select-none"
        aria-hidden="true"
      >
        {pin}
      </span>

      {/* Date badge */}
      <p className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-white/70 border border-slate-200 px-2.5 py-1 rounded-full mb-3">
        <span aria-hidden="true">📅</span> {note.tanggal}
      </p>

      {/* Note text */}
      <p className="text-sm text-foreground leading-relaxed">
        &ldquo;{note.isi_catatan}&rdquo;
      </p>
    </article>
  );
}

// ── Component ──────────────────────────────────────────────────
interface TeacherNotesProps {
  notes: CatatanAnakRow[];
}

export function TeacherNotes({ notes }: TeacherNotesProps) {
  return (
    <Card className="h-full card-3d overflow-hidden flex flex-col bg-white">
      <CardHeader className="pb-3 pt-5 px-5 sm:px-6 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
          <span aria-hidden="true">📝</span>
          Catatan Ustadz / Ustadzah
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-5 py-4">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <span className="text-4xl opacity-80" aria-hidden="true">🍃</span>
            <p className="text-sm font-semibold text-slate-400">Belum ada catatan dari guru</p>
          </div>
        ) : (
          <div className="space-y-4 pr-1">
            {notes.map((note, i) => (
              <NoteEntry key={i} note={note} index={i} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function TeacherNotesSkeleton() {
  return (
    <Card className="h-full card-3d overflow-hidden bg-white">
      <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100">
        <Skeleton className="h-6 w-52 rounded-full" />
      </CardHeader>
      <CardContent className="px-5 py-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 p-4 space-y-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
