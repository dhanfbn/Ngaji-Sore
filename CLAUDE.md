# KISFA (formerly Ngaji-Sore) — Project Context

> This file is the source of truth for cross-session Claude Code context.
> Paste/replace this file's content at the repo root before starting a new session.
> Don't change decisions already locked below without a strong reason — if scope
> changes, log it under "Backlog v2.1 / v3", don't fold it into the v2 scope
> that's currently in progress.

## Project Summary

KISFA (in-app brand name; repo/codebase still named Ngaji-Sore) is a web app
for reporting Quran-recitation (ngaji) learning progress for students (santri)
to their parents/guardians. Stakeholders: santri, wali murid (parent/guardian),
guru (teacher).

- **Repo**: github.com/dhanfbn/Ngaji-Sore (repo name unchanged — only the in-app brand/title changed to KISFA)
- **Framework**: Next.js
- **Deployment**: Vercel
- **Data source (v2)**: Google Sheets API (read-only)
- **Developer**: solo, no team

## Phase Roadmap

| Phase | Description | Status/Timeline |
|---|---|---|
| v2 (pilot) | Read-only dashboard, new KPI taxonomy | **In progress, 7-day timeline** |
| Phase 2 | Migration to a database (Postgres/MySQL), new auth (id_santri + password or Google Auth), all input (including from teachers) moves to the web — no longer manual in Sheets | Starts **27 July 2026** |
| Phase 3 | API opened up for the mobile app (Flutter) | No timeline yet |

## v2 Scope — LOCKED, don't expand mid-stream

**In scope:**
- Auth stays: `id_santri` + `tanggal_lahir`, plus simple rate limiting
  (e.g. max 5 attempts / 15 minutes per id_santri) — this is REQUIRED for v2, not optional
- Sidebar: only 2 active menu items — **Ringkasan** (Summary) and **Kehadiran**
  (Attendance). The other menus (Ziyadah, Murojaah, Tibyan, Tarbiyyah, Adab Harian)
  render **locked/disabled** (padlock icon), with no detail page in v2
  - **Update (decided during development)**: this applies to *sidebar
    navigation* only. All 6 KPI cards on the Ringkasan page itself **display
    real/live data** (not 5 of them locked/placeholder as in the initial
    JSON example below) — decided directly by the product owner mid-session,
    not scope creep. The only thing still locked is the *sidebar link* to
    the detail pages for those 5 categories, because those detail pages
    genuinely aren't built in v2. Kehadiran is also still locked in the
    sidebar for now because the `/dashboard/kehadiran` page hasn't been
    built yet (see "Implementation Status").
- Rebuild the Google Sheets schema to match the new KPI taxonomy (see Data Model)
- Rebuild all KPI UI components, progress chart, lesson plan, catatan anak
  (child notes), tugas rumah (homework) — per the UI sketches already discussed
- Read-only API layer via Next.js API routes (not the client/Flutter calling the
  Sheets API directly — everything goes through our own API route, so the
  contract doesn't change when we migrate DB in Phase 2)

**Out of scope for v2 (intentionally cut, don't add back):**
- Write API — all input stays manual by teachers in Google Sheets
- "Lembar Orang Tua" (Parent Sheet) feature — cancelled entirely, not deferred, not in v2
- Detail pages for Ziyadah/Murojaah/Tibyan/Tarbiyyah/Adab Harian

## Data Model (Google Sheets)

Sheets that are **kept as-is** (structure is already fine): `Santri`, `Kelas`, `Guru`

Sheets that are **rebuilt/new**:

### Kehadiran
```
id_kehadiran | id_santri | id_kelas | tanggal | status | catatan | created_by | key_minggu
```

### Ziyadah (new memorization material)
```
id_ziyadah | id_santri | id_kelas | surat | ayat_dari | ayat_sampai | progres_ayat | target_ayat | tanggal | catatan_guru | created_by | key_minggu
```

### Murojaah (review of previously memorized material)
```
id_murojaah | id_santri | id_kelas | surat_diulang | status_kelancaran | tanggal | catatan_guru | created_by | key_minggu
```
`status_kelancaran` (fluency status): Lancar / Cukup Lancar / Perlu Diulang (Fluent / Fairly Fluent / Needs Review)

### Tibyan (hijaiyah letter introduction)
```
id_tibyan | id_santri | id_kelas | materi_huruf | progres | target | tanggal | catatan_guru | created_by | key_minggu
```

### Tarbiyyah (weekly thematic character coaching)
```
id_tarbiyyah | id_santri | id_kelas | tema | status_capaian | tanggal | catatan_guru | created_by | key_minggu
```

### Adab_Harian (rebuilt from the old Adab sheet — fixes the swapped kategori/nilai column bug)
```
id_adab | id_santri | id_kelas | kategori (text, e.g. "Sopan Santun") | nilai (0-100) | catatan_guru | tanggal | created_by | key_minggu
```

### Lesson_Plan_Mingguan (per class, 5 rows per week per class)
```
id_lesson_plan | id_kelas | key_minggu | tanggal_mulai | tanggal_selesai | tema_minggu | hari | kategori | materi | created_by
```
- **v2.1 update (2026-07-15)**: the old numeric `minggu_ke` column was
  replaced by `key_minggu`, an ISO-8601 week string like `"2026-W29"` (see
  "Week Selector (v2.1)" below for the whole rollout). The dashboard's
  "Periode" is now a **dropdown** built from the distinct `key_minggu`
  values in this sheet for the santri's class, not an auto-detected "today
  falls in this range" match.
- **A fallback state is required** for when a santri's class has no
  Lesson_Plan_Mingguan rows at all yet — never let the dashboard render
  empty/broken without a message.

### Catatan_Anak (rebuilt from the old Catatan_Guru sheet)
```
id_catatan | id_santri | id_kelas | id_guru | tanggal | isi_catatan | created_by | minggu_ke
```
- The trailing column is literally named `minggu_ke` (not `key_minggu`) but
  holds the same ISO week string format (e.g. `"2026-W21"`). Kept as-is in
  `CatatanAnakSchema` to match the real header text — consider renaming the
  sheet column to `key_minggu` for consistency with the other sheets.

### Tugas_Rumah (Homework)
```
id_tugas | id_santri | id_kelas | key_minggu | deskripsi_tugas | status (belum/selesai) | tanggal_dibuat | created_by
```
- **Fixed 2026-07-15**: the old numeric `minggu_ke` column was renamed to
  `key_minggu` (not duplicated as first assumed — it's a straight replacement,
  same `"2026-Wxx"` format as the other sheets). `TugasRumahSchema` no longer
  has a `minggu_ke` field at all. Verified live against `STD0001`/`CLS001A`.

### Progres_Mingguan (for the "Perkembangan 4 Minggu" / 4-Week Progress chart — manually aggregated per week, do NOT compute on-the-fly from raw data on every request)
```
id_progres | id_santri | key_minggu | tanggal | kehadiran_pct | ziyadah_pct | murojaah_pct | tibyan_pct | tarbiyyah_pct | adab_pct
```
- This is also the source of the **KPI card** percentage for the 5
  categories other than Kehadiran, looked up by the **selected week**
  (`key_minggu`) from the Periode dropdown. Kehadiran is still computed live
  from raw `Kehadiran` rows filtered to the selected week (present / total
  sessions that week).
- **Fixed 2026-07-15**: the old numeric `minggu_ke` column was replaced by
  `key_minggu` (same format, not added alongside — `ProgresMingguanSchema`
  no longer has `minggu_ke`). This also required a chart-code fix: the
  trailing-4-week chart used to sort/slice/label by `minggu_ke` — it now
  sorts by `key_minggu` (string-sorts correctly since it's year-prefixed and
  zero-padded) and derives the "Mg. N" axis label from it via
  `formatWeekLabel()` in `dashboard.service.ts`. Verified live: chart now
  renders `Mg. 1`–`Mg. 4` correctly for `STD0001`.

**Known data quality issues to fix during the sheet rebuild (carried over from the old file):**
- ID collision: the old `Tahfizh` and `Doa` sheets both used the `HFZ00x` prefix — don't carry this over to the new sheets
- Old `Adab` sheet: the `kategori` column held numbers (should be text), with `nilai` separate — already fixed in the new `Adab_Harian` schema above
- Old `Target` sheet: had stray rows without headers at the bottom — don't let these get copied over during migration

**Found while developing against the v2 sheet currently in use (may not apply to other sheet instances, but the code is already defensive against this):**
- Many string cells across the sheets have leading/trailing whitespace (e.g. `" STD0001 "`) — `googleSheets.service.ts` already trims all cell values on parse. Don't assume raw data is clean when adding a new field.
- Date format is **inconsistent** across tabs: `Kehadiran`/`Ziyadah`/`Murojaah`/`Adab_Harian`/`Catatan_Anak` use `YYYY-MM-DD`, while `Tibyan`/`Tarbiyyah`/`Tugas_Rumah`/`Lesson_Plan_Mingguan`/`Progres_Mingguan` use `DD/MM/YYYY`. Always parse dates through `parseFlexibleDate()` in `src/lib/date.ts`, never `new Date(str)` directly — that mis-parses `DD/MM/YYYY`.
- The `Progres_Mingguan` tab in the original spreadsheet has a **trailing space** in its tab name (`"Progres_Mingguan "`). This is already hardcoded in `googleSheets.service.ts` (`RANGE_PROGRES_MINGGUAN`) — if the sheet is ever renamed/recreated without the space, update that constant too.
- `Ziyadah.progres_ayat` is filled in by teachers as a percentage string (e.g. `"25%"`), not an ayat count — don't use it to recompute the KPI percentage; that's why the Ziyadah KPI percentage source stays `Progres_Mingguan` (see above).

## Week Selector (v2.1, added 2026-07-15)

The dashboard is now filterable by week via a **Periode dropdown** in the
Header, replacing the old auto-detected "today falls in this lesson plan's
date range" text. Options come from the distinct `key_minggu` values in
`Lesson_Plan_Mingguan` for the santri's class.

**Architecture** (chosen over a client-side Context/global-bundle approach to
avoid a loading-UX regression and to keep `layout.tsx` cheap):
- The selected week lives in the URL as a search param: `/dashboard?minggu=2026-W29`.
- `Header.tsx` is a Client Component that reads/writes it via `useSearchParams()` +
  `router.push()` — this works even though `Header` is rendered from
  `layout.tsx`, because Next.js layouts don't receive a `searchParams` prop,
  but a Client Component can still read the live URL via the hook regardless
  of where it's rendered in the tree.
- `dashboard/page.tsx` (a Server Component) receives `searchParams` directly
  (Next 16: it's a `Promise`, must be `await`ed) and passes `minggu` to
  `getDashboardData(id_santri, selectedWeek)`.
- `dashboard/layout.tsx` calls `getHeaderInfo(id_santri)` for the profile +
  the `weeks` list + a `defaultWeek` (current ISO week if it has data, else
  the latest available week) — used as the dropdown's initial value before
  the user picks anything.
- Both `getHeaderInfo` and `getDashboardData` live in `dashboard.service.ts`
  and independently resolve "which week" via `resolveSelectedWeek()`: use
  the requested week if it's a valid option, else current ISO week if it has
  data, else the latest available week, else `''` (no weeks at all → empty
  fallback state, same as the old "Belum tersedia").
- `getISOWeekKey()` in `src/lib/date.ts` computes the `"YYYY-Www"` key from a
  `Date` (ISO-8601 week numbering) — validated against real sheet rows
  (`15/07/2026` → `"2026-W29"`).
- **What's filtered by the dropdown**: KPI cards (all 6, including Kehadiran
  recomputed live per-week), Lesson Plan Mingguan, Catatan Anak, Tugas di
  Rumah. **What's NOT filtered**: the "Perkembangan 4 Minggu" chart — it
  stays a global trailing-4-week trend regardless of the selected week,
  since pinning a multi-week trend chart to one week doesn't make sense.
- Verified end-to-end against the live sheet for `STD0001`/`CLS001A` (after
  both manual sheet fixes below landed): dropdown shows `1 – 4 Jan 2026` (the
  only week with lesson plan data), all 6 KPI cards match the sheet's
  `2026-W01` row exactly, all 5 Tugas Rumah items render, and the chart
  shows `Mg. 1`–`Mg. 4` — confirms the original bug report is fixed and the
  full week-filter rollout works end to end.

**Manual sheet fixes** (done directly in the spreadsheet — Claude only has read-only Sheets access):
1. ✅ **Done 2026-07-15**: `Tugas_Rumah`'s `minggu_ke` column renamed to `key_minggu`.
2. ✅ **Done 2026-07-15**: `Progres_Mingguan`'s `minggu_ke` column renamed to `key_minggu`.
   This required a follow-up code fix — see the note under Progres_Mingguan above.
3. Still outstanding (optional, consistency only): `Catatan_Anak`'s trailing
   week column is still named `minggu_ke` rather than `key_minggu` — works
   fine as-is (`CatatanAnakSchema.minggu_ke` matches it), rename only if you
   want naming consistency across all sheets.

## KPI Badge — Thresholds (locked, per category — updated 2026-07-15)

**Update (decided during development)**: the old threshold (5 tiers, same for
every category) was replaced by the product owner with 4 tiers, different for
Adab Harian vs. the other categories. Implemented in `src/lib/kpi.ts`
(`getBadgeLabel(value, kategori)`), called from `makeKPI()` in
`dashboard.service.ts`, passing the KPI `key` (`'adab'` vs. other categories)
as `kategori`.

Adab Harian:

| Range | Label |
|---|---|
| <20% | Butuh Pendampingan |
| <50% | Butuh Bimbingan |
| <80% | Baik |
| ≥80% | Sangat Baik |

Other categories (Kehadiran, Ziyadah, Murojaah, Tibyan, Tarbiyyah):

| Range | Label |
|---|---|
| <20% | Pasif |
| <50% | Mengikuti Sedikit |
| <80% | Mengikuti Sebagian |
| ≥80% | Aktif Mengikuti |

## API Contract (v2, read-only, prefix `/api/v1`)

### `POST /api/v1/auth/login`
```
body: { id_santri, tanggal_lahir }
response: { token/session, santri: { id, nama, kelas, foto_url } }
```
+ rate limit per id_santri (e.g. max 5 attempts / 15 minutes)

### `GET /api/v1/santri/:id/ringkasan`
A single aggregate endpoint — fetches all dashboard data in one server-side
call to Sheets (not 6 separate calls per card, since that wastes quota and is
slow). KPI structure is **generic** (array of objects), so adding/locking a
new KPI doesn't change the response shape:
```json
{
  "santri": { "nama": "...", "kelas": "...", "periode": "...", "semester": "..." },
  "kpi": [
    { "key": "kehadiran", "label": "Kehadiran", "value": 83, "unit": "%", "detail": "...", "badge": "Aktif Mengikuti", "locked": false },
    { "key": "ziyadah", "label": "Ziyadah", "value": 75, "unit": "%", "detail": "...", "badge": "Mengikuti Sebagian", "locked": true }
  ],
  "progres_4_minggu": [ { "minggu": "Mg.1", "kehadiran": 80, "ziyadah": 60 } ],
  "lesson_plan": { "tema": "...", "hari": [ { "hari": "Senin", "kategori": "Tibyan", "materi": "..." } ] },
  "catatan_anak": { "isi": "...", "tanggal": "..." },
  "tugas_rumah": [ { "deskripsi": "...", "status": "belum" } ]
}
```

### `GET /api/v1/santri/:id/kehadiran?minggu=X`
The only detail page besides Ringkasan (matches the sidebar's 2 active menu items):
```json
{ "riwayat": [ { "tanggal": "...", "status": "Hadir", "catatan": "..." } ] }
```

## UI Layout (Ringkasan)

- **Sidebar**: logo (dynamic per santri's class — see "Implementation Status"),
  Ringkasan menu (active) + Kehadiran (locked, see note below), 5 other menus locked
- **Header**: santri profile (name, class, year) top right + learning period
  as a **week-selector dropdown** (see "Week Selector (v2.1)") + semester
- **6 KPI cards**: percentage, position detail (e.g. "Al-Baqarah 1-5, Hal 3/5"),
  progress bar, badge label per threshold
- **Perkembangan 4 Minggu chart**: line chart per category
- **Lesson Plan Mingguan**: per day (Mon-Fri), category + material
- **Catatan Anak**: narrative note from the teacher
- **Tugas di Rumah**: homework checklist

## Implementation Status (updated as of the last session)

**Already built:**
- The Ringkasan page (`/dashboard`) v2, complete: 6 KPI cards (compact,
  all live data — see the note in "v2 Scope"), Perkembangan 4 Minggu chart
  (6 categories), Lesson Plan Mingguan (middle position, color badge per
  day + category icon, fallback state if the teacher hasn't filled it in),
  Catatan Anak (shows only the latest note, not a list), Tugas di Rumah
  (checklist). Chart / Lesson Plan / Catatan+Tugas are laid out as 3 equal-width,
  equal-height columns.
- Santri profile header (name, class, period, semester) — class & period are
  fetched live from the `Kelas` and `Lesson_Plan_Mingguan` sheets (not static
  fields), semester is computed from today's date (school calendar
  convention: Ganjil/Odd = Jul–Dec, Genap/Even = Jan–Jun). Mobile version:
  avatar expands/collapses, not just a static avatar.
- Full data/service layer for the v2 taxonomy (`src/types/database.ts`,
  `src/services/googleSheets.service.ts`, `src/services/dashboard.service.ts`)
  already reusable for other consumers (including API routes if built later).
- Dynamic sidebar logo per santri's class: `getHeaderInfo()` in
  `dashboard.service.ts` now also returns `kelasId` (raw `id_kelas`,
  e.g. `CLS001A`), threaded from `dashboard/layout.tsx` to `Sidebar`/`Header`
  and then to `SidebarContent`. The logo mapping lives in `getLogoSrc()` in
  `src/components/layout/Sidebar.tsx`: `CLS001A`/`CLS002B`/`CLS003C` →
  `Logo_Daycare.jpeg`, `CLS004D` → `Logo_Taud.jpeg`, `CLSSD01`–`CLSSD06` →
  `Logo_SD.jpeg`, other classes fall back to the default `logo.jpeg`. Logo
  files live in `public/`. When adding a new class, update the
  `DAYCARE_KELAS`/`TAUD_KELAS`/`SD_KELAS` arrays in that same file.
- Tugas di Rumah (`HomeworkList.tsx`): the checklist is now a 2-column grid
  from the `sm:` breakpoint up, with `max-h` + `overflow-y-auto` so a long
  list scrolls inside the card instead of stretching the card / overlapping
  content below it (applies at every breakpoint including mobile, not just desktop).
- Week selector / Periode dropdown — see "Week Selector (v2.1)" above for the
  full architecture. This also fixed a real bug: the dashboard is used well
  into 2026-W29 (mid-July) but only `2026-W01` (Jan) had lesson plan data for
  `CLS001A`, so the old "does today fall in this date range" auto-detect
  always came up empty. The dropdown sidesteps that by letting any available
  week be picked directly, and defaults to it when the current week has no data.

**Not yet built / deviations from the contract above — important for follow-up sessions:**
- **The `/api/v1/...` routes above don't exist at all yet.** The current
  implementation calls `dashboard.service.ts` **directly from a Server
  Component** (`app/dashboard/page.tsx`, `app/dashboard/layout.tsx`), not
  through an HTTP endpoint. The service layer is already shaped so it's easy
  to wrap into a route handler once/if Phase 3 (mobile) needs a real
  endpoint — just create `app/api/v1/santri/[id]/ringkasan/route.ts` etc.
  calling the same functions.
- Login rate limiting (max 5 attempts/15 minutes) is **not implemented yet**
  — `app/api/login/route.ts` currently only checks `id_santri` +
  `tanggal_lahir` with no attempt limit. This is REQUIRED for v2 per the
  scope above and isn't done yet.
- The `/dashboard/kehadiran` detail page hasn't been built yet, so Kehadiran
  still shows locked in the sidebar even though its KPI card is already live.

## Working Principles for This Session

1. Don't rebuild the whole project — keep the Next.js config, Sheets API
   connection, Vercel deployment. Focus the rebuild on: data schema, KPI/UI
   components, API layer.
2. The API contract is designed to be data-source-agnostic, so that when
   Phase 2 migrates to Postgres/MySQL, only the internal API route
   implementation changes — not the request/response contract to the
   frontend/mobile.
3. If a new feature/KPI idea comes up during development, log it under
   "Backlog v2.1 / v3" below — don't fold it into the v2 scope that's
   currently in progress.

## Backlog v2.1 / v3 (not yet worked on, don't touch now)

- "Lembar Orang Tua" (Parent Sheet) feature (cancelled in v2, might be reconsidered later)
- Detail pages for Ziyadah, Murojaah, Tibyan, Tarbiyyah, Adab Harian
- Full write API (teacher data entry via web/mobile) — goes into Phase 2
- Password/Google Auth-based auth — goes into Phase 2
- API for the Flutter mobile app — goes into Phase 3
