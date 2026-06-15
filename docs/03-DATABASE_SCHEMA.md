# Database Schema

## Data Source

Google Spreadsheet

---

# Worksheet: Santri

| Field | Type |
|---------|---------|
| id_santri | string |
| nama | string |
| foto_url | string |
| tanggal_lahir | date |
| kelas | string |
| periode_belajar | string |
| status | string |

---

# Worksheet: Kehadiran

| Field | Type |
|---------|---------|
| id_santri | string |
| tanggal | date |
| status | enum |

Allowed Values:

- Hadir
- Izin
- Alpha

---

# Worksheet: Tilawah

| Field | Type |
|---------|---------|
| id_santri | string |
| jenis | string |
| materi | string |
| progress | number |
| target | number |
| tanggal | date |

Jenis:

- IQRO
- ALQURAN

---

# Worksheet: Tahfiz

| Field | Type |
|---------|---------|
| id_santri | string |
| surat | string |
| ayat_selesai | number |
| target_ayat | number |
| tanggal | date |

---

# Worksheet: Doa

| Field | Type |
|---------|---------|
| id_santri | string |
| nama_doa | string |
| status | string |

---

# Worksheet: Adab

| Field | Type |
|---------|---------|
| id_santri | string |
| kategori | string |
| nilai | number |

---

# Worksheet: CatatanGuru

| Field | Type |
|---------|---------|
| id_santri | string |
| tanggal | date |
| catatan | text |

---

# Worksheet: TargetPencapaian

| Field | Type |
|---------|---------|
| id_santri | string |
| kategori | string |
| target | string |
| deadline | date |