# PRD — Laporan Progres Belajar Ngaji Sore

## 1. Overview

### Project Name

Laporan Progres Belajar Ngaji Sore – Ruang Belajar Quran Anak

### Project Type

Web Application (MVP)

### Purpose

This application is a web-based student progress dashboard designed for santri and parents to monitor learning progress in a simple, engaging, and visually appealing way.

Teachers will continue managing data through Google Spreadsheet, while the application will act as a visualization and reporting platform.

The application should be optimized for both desktop and mobile devices and should provide a fun and child-friendly experience.

---

## Problem Statement

Currently, student progress data is stored inside spreadsheets and is not easily accessible by parents or students.

Challenges include:

* Parents cannot easily monitor learning progress.
* Students do not have visibility into their achievements.
* Learning targets are difficult to track.
* Teacher feedback is scattered and difficult to access.
* Existing reports are not engaging for children.

---

## Project Goals

### Parent Goals

* Monitor student progress anytime.
* View current learning achievements.
* Access teacher feedback easily.

### Student Goals

* Understand learning progress.
* Stay motivated through visual achievements.
* Track upcoming learning targets.

### Teacher Goals

* Continue using Google Sheets as the primary data source.
* Reduce manual reporting efforts.

---

## 2. Requirements

### Authentication

The application uses a simple authentication mechanism.

Login Fields:

* ID Santri
* Tanggal Lahir

Validation Process:

1. User enters ID Santri.
2. User enters Tanggal Lahir.
3. System validates data against worksheet "Santri".
4. If matched, login succeeds.
5. If not matched, show validation error.

No password is required.

---

### User Role

Current MVP supports:

* Santri
* Orang Tua

Admin dashboard is out of scope for MVP.

Teachers will manage data directly through Google Spreadsheet.

---

## Platform Requirements

* Responsive Web Application
* Mobile Friendly
* Vercel Deployment Ready

---

## Data Source

Primary Data Source:

Google Spreadsheet

The application must consume data through Google Sheets API.

Google Spreadsheet will contain the following worksheets:

* Santri
* Kehadiran
* Tilawah
* Tahfiz
* Doa
* Adab
* CatatanGuru
* TargetPencapaian

---

## Core Modules

### Ringkasan

Main dashboard overview displaying:

* KPI Summary
* Progress Chart
* Current Achievement
* Catatan Guru
* Target Selanjutnya

---

### Kehadiran

Future Module (Locked)

Displays attendance history and statistics.

---

### Tilawah

Future Module (Locked)

Submenus:

* Iqro
* Al Quran

Displays reading progress.

---

### Tahfiz

Future Module (Locked)

Displays memorization progress and achievements.

---

### Doa & Dzikir

Future Module (Locked)

Displays completed and upcoming doa targets.

---

### Adab & Sikap

Future Module (Locked)

Displays behavioral assessment and progress.

---

### Catatan Guru

Future Module (Locked)

Displays complete teacher notes history.

---

## Dashboard Layout

### Sidebar

Top Section:

* Logo

Menu Items:

* Ringkasan
* Kehadiran (Locked)
* Tilawah (Locked)
  * Iqro
  * Al Quran
* Tahfiz (Locked)
* Doa & Dzikir (Locked)
* Adab & Sikap (Locked)
* Catatan Guru (Locked)

Bottom Section:

* Logout Button
* Thank You Card

---

### Header

Left Side:

* Logo
* Application Title

Right Side:

Student Profile Card

Fields:

* Photo
* Nama
* Kelas
* Umur
* Periode Belajar

---

### KPI Section

Display 4 KPI cards:

* Kehadiran
* Tilawah
* Tahfiz
* Adab & Doa

Each KPI card must display:

* Percentage
* Label
* Progress Indicator

---

### Progress Chart

Chart Type:

Line Chart

Metrics:

* Kehadiran
* Tilawah
* Tahfiz
* Adab

Period:

Monthly Progress

---

### Current Achievement

Display current active learning targets.

Example:

| Category | Current Progress        |
| -------- | ----------------------- |
| Tilawah  | Iqro 5 Halaman 20       |
| Tahfiz   | An-Naba Ayat 1-10       |
| Doa      | Doa Sebelum Tidur       |
| Dzikir   | Dzikir Setelah Sholat   |
| Shiroh   | Kisah Nabi Muhammad     |

---

### Catatan Guru

Display latest teacher notes.

Latest note should appear first.

---

### Target Selanjutnya

Display upcoming learning targets.

Example:

| Category | Next Target                 |
| -------- | --------------------------- |
| Tilawah  | Iqro 5 Halaman 21           |
| Tahfiz   | An-Naba Ayat 11-20          |
| Doa      | Doa Keluar Rumah            |
| Dzikir   | Dzikir Setelah Sholat       |
| Shiroh   | Kisah Nabi Muhammad         |

---

## UI & UX Goals

The application should feel:

* Fun
* Friendly
* Modern
* Child-Friendly
* Motivating

Design Inspiration:

* Duolingo
* Khan Academy Kids
* Ruangguru

Avoid:

* Corporate dashboard style
* Enterprise UI appearance
* Complex navigation

---

## Success Criteria

The MVP is considered complete when:

* Login using ID Santri and Tanggal Lahir works correctly.
* Data is successfully loaded from Google Sheets.
* Dashboard displays KPI data correctly.
* Progress chart displays correctly.
* Catatan Guru displays correctly.
* Target Selanjutnya displays correctly.
* Responsive layout works on mobile and desktop.
* Application is successfully deployed to Vercel.

END OF DOCUMENT
