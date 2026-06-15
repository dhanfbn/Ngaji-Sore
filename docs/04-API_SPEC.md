# API Specification

Base URL

/api

---

# POST /api/login

Description:

Authenticate student using ID Santri and Tanggal Lahir.

Request

{
  "id_santri": "S001",
  "tanggal_lahir": "2017-05-12"
}

Response

{
  "success": true,
  "data": {
    "id": "S001",
    "nama": "Ahmad Fauzan"
  }
}

---

# POST /api/logout

Description:

Destroy active session.

Response

{
  "success": true
}

---

# GET /api/dashboard/:id

Description:

Retrieve dashboard summary information.

Response

{
  "profile": {},
  "kpis": {},
  "chartData": [],
  "teacherNotes": [],
  "nextTargets": []
}

---

# KPI Calculation Rules

## Kehadiran

Hadir = 100

Izin = 50

Alpha = 0

Formula:

(total score / max score) * 100

---

## Tilawah

(progress / target) * 100

---

## Tahfiz

(total ayat_selesai / target_ayat) * 100

---

## Doa

(completed doa / total target doa) * 100

---

## Adab

average(nilai)