# Ngaji-Sore — Project Context

> File ini adalah sumber kebenaran untuk konteks project lintas sesi Claude Code.
> Paste/replace isi file ini di root repo sebelum memulai sesi baru. Jangan ubah keputusan
> yang sudah dikunci di bawah tanpa alasan kuat — kalau ada perubahan scope, catat di
> bagian "Backlog v2.1 / v3", jangan disisipkan ke scope v2 yang sedang berjalan.

## Ringkasan Project

Ngaji-Sore adalah aplikasi web untuk melaporkan progres belajar ngaji (santri) ke
orang tua/wali murid. Stakeholder: santri, wali murid, guru.

- **Repo**: github.com/dhanfbn/Ngaji-Sore
- **Framework**: Next.js
- **Deployment**: Vercel
- **Data source (v2)**: Google Sheets API (read-only)
- **Developer**: solo, tanpa tim

## Roadmap Fase

| Fase | Deskripsi | Status/Timeline |
|---|---|---|
| v2 (pilot) | Read-only dashboard, taksonomi KPI baru | **Sedang dikerjakan, timeline 7 hari** |
| Fase 2 | Migrasi ke database (Postgres/MySQL), auth baru (id_santri + password atau Google Auth), semua input (termasuk guru) pindah ke web — tidak lagi manual di Sheets | Mulai **27 Juli 2026** |
| Fase 3 | API dibuka untuk mobile app (Flutter) | Belum ada timeline |

## Scope v2 — TERKUNCI, jangan diperluas di tengah jalan

**Yang dikerjakan:**
- Auth tetap: `id_santri` + `tanggal_lahir`, ditambah rate limiting sederhana
  (mis. max 5 percobaan / 15 menit per id_santri) — ini WAJIB masuk v2, bukan opsional
- Sidebar: hanya 2 menu aktif — **Ringkasan** dan **Kehadiran**. Menu lain
  (Ziyadah, Murojaah, Tibyan, Tarbiyyah, Adab Harian) tampil **locked/disabled**
  (ikon gembok), tidak ada halaman detailnya di v2
  - **Update (diputuskan saat development)**: ini berlaku untuk *navigasi
    sidebar* saja. Ke-6 KPI card di halaman Ringkasan sendiri **semua
    menampilkan data asli/live** (bukan 5 di antaranya locked/placeholder
    seperti contoh JSON awal di bawah) — diputuskan langsung oleh product
    owner di tengah sesi, bukan scope creep. Yang tetap locked hanya
    *link sidebar* ke halaman detail 5 kategori tsb, karena halaman
    detailnya memang tidak dibuat di v2. Kehadiran juga masih locked di
    sidebar untuk saat ini karena halaman `/dashboard/kehadiran` belum
    dibuat (lihat "Status Implementasi").
- Rebuild skema Google Sheets sesuai taksonomi KPI baru (lihat bagian Data Model)
- Rebuild seluruh komponen UI KPI, chart progres, lesson plan, catatan anak,
  tugas rumah — sesuai sketsa UI yang sudah didiskusikan
- API layer read-only di Next.js API routes (bukan Flutter/klien manggil Sheets
  API langsung — semua lewat API route sendiri, supaya kontrak tidak berubah
  saat migrasi DB di Fase 2)

**Yang TIDAK dikerjakan di v2 (sengaja dicoret, jangan ditambahkan):**
- Write API — semua input tetap manual oleh guru di Google Sheets
- Fitur "Lembar Orang Tua" — dibatalkan total, tidak ditunda, tidak ada di v2
- Halaman detail untuk Ziyadah/Murojaah/Tibyan/Tarbiyyah/Adab Harian

## Data Model (Google Sheets)

Sheet yang **dipertahankan** (struktur sudah oke): `Santri`, `Kelas`, `Guru`

Sheet yang **rebuild/baru**:

### Kehadiran
```
id_kehadiran | id_santri | id_kelas | tanggal | status | catatan | created_by
```

### Ziyadah (materi hafalan baru)
```
id_ziyadah | id_santri | id_kelas | surat | ayat_dari | ayat_sampai | progres_ayat | target_ayat | tanggal | catatan_guru | created_by
```

### Murojaah (pengulangan hafalan lama)
```
id_murojaah | id_santri | id_kelas | surat_diulang | status_kelancaran | tanggal | catatan_guru | created_by
```
`status_kelancaran`: Lancar / Cukup Lancar / Perlu Diulang

### Tibyan (pengenalan huruf hijaiyah)
```
id_tibyan | id_santri | id_kelas | materi_huruf | progres | target | tanggal | catatan_guru | created_by
```

### Tarbiyyah (pembinaan adab tematik mingguan)
```
id_tarbiyyah | id_santri | id_kelas | tema | status_capaian | tanggal | catatan_guru | created_by
```

### Adab_Harian (rebuild dari sheet Adab lama — fix bug kolom kategori/nilai tertukar)
```
id_adab | id_santri | id_kelas | kategori (teks, mis. "Sopan Santun") | nilai (0-100) | catatan_guru | tanggal
```

### Lesson_Plan_Mingguan (per kelas, 5 baris per minggu per kelas)
```
id_lesson_plan | id_kelas | minggu_ke | tanggal_mulai | tanggal_selesai | tema_minggu | hari | kategori | materi | created_by
```
- "Periode belajar" di header dashboard dihitung **otomatis**: cari baris yang
  tanggal hari ini jatuh di antara `tanggal_mulai` dan `tanggal_selesai` untuk
  kelas santri tsb.
- **WAJIB ada fallback state** kalau lesson plan minggu berjalan belum diisi
  guru — jangan biarkan dashboard kosong/error tanpa pesan.

### Catatan_Anak (rebuild dari Catatan_Guru lama)
```
id_catatan | id_santri | id_kelas | id_guru | tanggal | isi_catatan | created_by
```

### Tugas_Rumah
```
id_tugas | id_santri | id_kelas | minggu_ke | deskripsi_tugas | status (belum/selesai) | tanggal_dibuat | created_by
```

### Progres_Mingguan (untuk chart "Perkembangan 4 Minggu" — agregat manual per minggu, JANGAN hitung on-the-fly dari raw data tiap request)
```
id_progres | id_santri | minggu_ke | tanggal | kehadiran_pct | ziyadah_pct | murojaah_pct | tibyan_pct | tarbiyyah_pct | adab_pct
```
- Ini juga sumber persen **KPI card saat ini** untuk 5 kategori selain
  Kehadiran (ambil baris `minggu_ke` terbesar). Kehadiran tetap dihitung
  live dari raw `Kehadiran` (hadir/total pertemuan) karena rumusnya simpel
  dan selalu akurat tanpa perlu input manual guru.

**Known data quality issues yang harus di-fix saat rebuild sheet (dari file lama):**
- ID kolisi: `Tahfizh` dan `Doa` sheet lama sama-sama pakai prefix `HFZ00x` — jangan diwariskan ke sheet baru
- Sheet `Adab` lama: kolom `kategori` isinya angka (harusnya teks), `nilai` terpisah — sudah di-fix di skema `Adab_Harian` baru di atas
- Sheet `Target` lama: ada baris data nyasar tanpa header di bagian bawah — jangan ikut ter-copy saat migrasi

**Ditemukan saat development sheet v2 yang sekarang dipakai (belum tentu berlaku ke instance sheet lain, tapi kode sudah defensif terhadap ini):**
- Banyak sel string di seluruh sheet punya leading/trailing whitespace (mis. `" STD0001 "`) — `googleSheets.service.ts` sudah trim semua nilai sel saat parsing. Jangan asumsikan data mentah sudah bersih kalau nambah field baru.
- Format tanggal **tidak konsisten** antar tab: `Kehadiran`/`Ziyadah`/`Murojaah`/`Adab_Harian`/`Catatan_Anak` pakai `YYYY-MM-DD`, sedangkan `Tibyan`/`Tarbiyyah`/`Tugas_Rumah`/`Lesson_Plan_Mingguan`/`Progres_Mingguan` pakai `DD/MM/YYYY`. Selalu parse tanggal lewat `parseFlexibleDate()` di `src/lib/date.ts`, jangan `new Date(str)` langsung — itu salah-parse `DD/MM/YYYY`.
- Tab `Progres_Mingguan` di spreadsheet asli punya **trailing space** di nama tab (`"Progres_Mingguan "`). Sudah di-hardcode di `googleSheets.service.ts` (`RANGE_PROGRES_MINGGUAN`) — kalau sheet-nya di-rename/dibuat ulang tanpa spasi, update konstanta itu juga.
- `Ziyadah.progres_ayat` diisi guru sebagai string persentase (mis. `"25%"`), bukan hitungan ayat — jangan dipakai untuk hitung ulang persen KPI, itu sebabnya sumber persen KPI Ziyadah tetap dari `Progres_Mingguan` (lihat di atas).

## Badge KPI — Threshold (locked, pakai `>` konsisten di semua batas)

| Range | Label |
|---|---|
| 0% – 50% | Perlu Perhatian |
| >50% – 70% | Rajin |
| >70% – 80% | Baik |
| >80% – 90% | Baik Sekali |
| >90% – 100% | Sangat Baik |

Berlaku sama untuk semua 6 kategori KPI (Kehadiran, Ziyadah, Murojaah, Tibyan, Tarbiyyah, Adab Harian).

## API Contract (v2, read-only, prefix `/api/v1`)

### `POST /api/v1/auth/login`
```
body: { id_santri, tanggal_lahir }
response: { token/session, santri: { id, nama, kelas, foto_url } }
```
+ rate limit per id_santri (mis. max 5 percobaan / 15 menit)

### `GET /api/v1/santri/:id/ringkasan`
Satu endpoint agregat — mengambil semua data dashboard dalam satu kali panggilan
server-side ke Sheets (bukan 6 panggilan terpisah per card, karena boros quota
dan lambat). Struktur KPI **generic** (array of objects), supaya menambah/mengunci
KPI baru tidak mengubah struktur response:
```json
{
  "santri": { "nama": "...", "kelas": "...", "periode": "...", "semester": "..." },
  "kpi": [
    { "key": "kehadiran", "label": "Kehadiran", "value": 83, "unit": "%", "detail": "...", "badge": "Rajin", "locked": false },
    { "key": "ziyadah", "label": "Ziyadah", "value": 75, "unit": "%", "detail": "...", "badge": "Baik", "locked": true }
  ],
  "progres_4_minggu": [ { "minggu": "Mg.1", "kehadiran": 80, "ziyadah": 60 } ],
  "lesson_plan": { "tema": "...", "hari": [ { "hari": "Senin", "kategori": "Tibyan", "materi": "..." } ] },
  "catatan_anak": { "isi": "...", "tanggal": "..." },
  "tugas_rumah": [ { "deskripsi": "...", "status": "belum" } ]
}
```

### `GET /api/v1/santri/:id/kehadiran?minggu=X`
Satu-satunya halaman detail selain Ringkasan (sesuai sidebar yang cuma 2 menu aktif):
```json
{ "riwayat": [ { "tanggal": "...", "status": "Hadir", "catatan": "..." } ] }
```

## UI Layout (Ringkasan)

- **Sidebar**: logo, menu Ringkasan (aktif) + Kehadiran (aktif), 5 menu lain locked
- **Header**: profile santri (nama, kelas, tahun) kanan atas + periode belajar
  (otomatis dari lesson plan) + semester
- **6 KPI cards**: persen, detail posisi (mis. "Al-Baqarah 1-5, Hal 3/5"),
  progress bar, badge label sesuai threshold
- **Grafik Perkembangan 4 Minggu**: line chart per kategori
- **Lesson Plan Mingguan**: per hari (Senin-Jumat), kategori + materi
- **Catatan Anak**: catatan naratif dari guru
- **Tugas di Rumah**: checklist tugas

## Status Implementasi (update per sesi terakhir)

**Sudah dibangun:**
- Halaman Ringkasan (`/dashboard`) versi v2 lengkap: 6 KPI card (compact,
  semua live data — lihat catatan di "Scope v2"), grafik Perkembangan 4
  Minggu (6 kategori), Lesson Plan Mingguan (posisi tengah, badge warna per
  hari + ikon kategori, fallback state kalau guru belum isi), Catatan Anak
  (nampilkan catatan terbaru saja, bukan list), Tugas di Rumah (checklist).
  Chart / Lesson Plan / Catatan+Tugas disusun 3 kolom sama lebar & sama tinggi.
- Header profil santri (nama, kelas, periode, semester) — kelas & periode
  diambil live dari sheet `Kelas` dan `Lesson_Plan_Mingguan` (bukan field
  statis), semester dihitung dari tanggal hari ini (konvensi kalender
  sekolah: Ganjil = Jul–Des, Genap = Jan–Jun). Versi mobile: avatar
  expand/collapse, bukan cuma avatar diam.
- Data/service layer penuh untuk taksonomi v2 (`src/types/database.ts`,
  `src/services/googleSheets.service.ts`, `src/services/dashboard.service.ts`)
  sudah reusable untuk konsumen lain (termasuk API routes kalau dibuat nanti).

**BELUM dibangun / deviasi dari kontrak di atas — penting buat sesi lanjutan:**
- **API routes `/api/v1/...` di atas belum ada sama sekali.** Implementasi
  saat ini memanggil `dashboard.service.ts` **langsung dari Server Component**
  (`app/dashboard/page.tsx`, `app/dashboard/layout.tsx`), bukan lewat HTTP
  endpoint. Service layer-nya sudah dalam bentuk yang gampang dibungkus jadi
  route handler kalau/waktu Fase 3 (mobile) butuh endpoint asli — tinggal
  buat `app/api/v1/santri/[id]/ringkasan/route.ts` dkk yang manggil fungsi
  yang sama.
- Rate limiting login (max 5 percobaan/15 menit) **belum diimplementasi** —
  `app/api/login/route.ts` saat ini cuma cek `id_santri` + `tanggal_lahir`
  tanpa batas percobaan. Ini WAJIB masuk v2 menurut scope di atas, belum selesai.
- Halaman detail `/dashboard/kehadiran` belum dibuat, jadi Kehadiran masih
  tampil locked di sidebar walau KPI card-nya sudah live.

## Prinsip Kerja untuk Sesi Ini

1. Jangan rebuild seluruh project — pertahankan Next.js config, koneksi Sheets
   API, deployment Vercel. Fokus rebuild di: skema data, komponen UI/KPI, API layer.
2. Kontrak API didesain agnostik terhadap sumber data, supaya saat Fase 2
   migrasi ke Postgres/MySQL, hanya implementasi internal API route yang
   berubah — bukan kontrak request/response ke frontend/mobile.
3. Kalau muncul ide fitur/KPI baru selama development, catat di bagian
   "Backlog v2.1 / v3" di bawah — jangan disisipkan ke scope v2 yang sedang berjalan.

## Backlog v2.1 / v3 (belum dikerjakan, jangan disentuh sekarang)

- Fitur "Lembar Orang Tua" (dibatalkan di v2, mungkin dipertimbangkan lagi nanti)
- Halaman detail untuk Ziyadah, Murojaah, Tibyan, Tarbiyyah, Adab Harian
- Write API penuh (entry data guru via web/mobile) — masuk Fase 2
- Auth berbasis password/Google Auth — masuk Fase 2
- API untuk Flutter mobile — masuk Fase 3
