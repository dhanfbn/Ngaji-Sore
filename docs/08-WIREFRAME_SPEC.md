# Wireframe Specification

## Overview

This document defines the visual structure and layout requirements for the application.

Reference Assets:

* assets/login-page.png
* assets/dashboard-page.png

These images are considered the primary UI source of truth.

Implementation should closely follow the layout, spacing, hierarchy, and visual style shown in the wireframes.

---

# Login Page

Reference:

assets/login-page.png

---

## Layout Structure

Full-screen centered layout.

The login card should be vertically and horizontally centered.

Background should use a very soft green gradient.

Decorative Islamic-themed illustrations may be placed in page corners.

---

## Top Section

Position:

Centered above login card.

Components:

1. Application Logo
2. Tagline

Tagline:

"Belajar • Mengaji • Berkah 💚"

Spacing:

* 24px between logo and card
* 16px below tagline

---

## Login Card

Maximum Width:

420px

Card Style:

* White background
* Rounded corners
* Soft shadow
* Subtle border

---

### Header

Title:

"Halo, Santri! 👋"

Subtitle:

"Masuk untuk lihat laporan belajarmu"

Alignment:

Centered

---

### Form Fields

Field 1

Label:

ID SANTRI

Placeholder:

Contoh: STD0001

Leading Icon:

Student ID icon

---

Field 2

Label:

TANGGAL LAHIR

Input Type:

Date Picker

Leading Icon:

Calendar

Helper Text:

"Sesuai tanggal lahir yang didaftarkan ustadz/ustadzah"

---

### Primary Button

Text:

🚀 Lihat Laporanku!

Width:

Full Width

Height:

48px

Style:

* Bright Green
* Rounded
* Soft Shadow

---

### Footer Text

Position:

Below login card

Text:

"Lupa ID atau tanggal lahir? Tanyakan ke ustadz/ustadzah 😊"

Alignment:

Center

---

# Dashboard Page

Reference:

assets/dashboard-page.png

---

## Desktop Layout

Page Layout:

Sidebar + Main Content

Structure:

Sidebar Width: 260px

Content Area: Remaining Width

Gap: 24px

---

# Sidebar

Fixed Left Sidebar

---

## Logo Section

Position:

Top

Contains:

* Logo
* Tagline

Tagline:

"Belajar • Mengaji • Berkah"

---

## Navigation Menu

Menu Order:

1. Ringkasan
2. Kehadiran
3. Tilawah
4. Hafalan
5. Adab & Sikap
6. Catatan Guru

Current MVP:

Only Ringkasan is active.

All other menus:

* Disabled
* Show Lock Icon
* Not Clickable

---

## Thank You Card

Position:

Bottom Sidebar

Contains:

* Family Illustration
* Appreciation Message

Text:

"Terima kasih atas dukungan Ayah Bunda"

Purpose:

Create emotional connection with parents.

---

# Header

Height:

100px

---

## Left Section

Application Logo

Title:

"Laporan Progres Belajar Ngaji Sore"

Subtitle:

"Ruang Belajar Quran Anak"

---

## Right Section

Student Profile Card

Width:

320px

Contains:

* Student Avatar
* Nama
* Kelas Anak
* Periode Belajar

Card Style:

Rounded with subtle shadow

---

# KPI Section

Position:

Below Header

Grid Layout:

Desktop:

4 Columns

Tablet:

2 Columns

Mobile:

1 Column

---

## KPI Card Structure

All cards share same structure.

Elements:

1. Circular Icon
2. KPI Title
3. Percentage
4. Supporting Description
5. Achievement Badge

---

### Card 1

Title:

Kehadiran

Color:

Green

---

### Card 2

Title:

Tilawah

Color:

Blue

---

### Card 3

Title:

Tahfiz

Color:

Purple

---

### Card 4

Title:

Adab & Sikap

Color:

Yellow

---

# Main Content Row 1

Two-column layout.

Ratio:

60 / 40

---

## Left Card

Perkembangan 4 Minggu Terakhir

Chart Type:

Multi-Series Line Chart

Series:

* Kehadiran
* Tilawah
* Tahfiz
* Adab & Sikap

---

## Right Column

Contains two stacked cards.

---

### Card 1

Title:

Capaian Saat Ini

Display:

Key-value table

Rows:

* Tilawah
* Tahfiz
* Doa
* Dzikir
* Shiroh

---

### Card 2

Title:

Target Selanjutnya

Display:

Key-value table

Rows:

* Tilawah
* Tahfiz
* Doa
* Dzikir
* Shiroh

---

# Main Content Row 2

Full Width Card

---

## Catatan Guru

Height:

160px minimum

Contains:

* Teacher Note Icon
* Latest Teacher Feedback
* Teacher Illustration

Purpose:

Highlight qualitative progress and encouragement.

---

# Responsive Requirements

## Tablet

Sidebar collapses into Drawer.

KPI Cards become:

2 columns.

Chart stacks above tables.

---

## Mobile

Sidebar becomes Slide Drawer.

Header stacks vertically.

Profile Card moves below title.

KPI Cards become:

1 column.

All content cards become full width.

---

# Visual Style

The application should feel:

* Friendly
* Cheerful
* Motivating
* Child-Friendly

Visual Inspirations:

* Duolingo
* Khan Academy Kids
* Ruangguru

Avoid:

* Corporate dashboards
* Dense data tables
* Enterprise software appearance

---

# UI Priority

Priority Order:

1. Student Progress
2. KPI Overview
3. Teacher Notes
4. Current Achievement
5. Future Targets

The user should immediately understand their learning progress within the first 3 seconds after opening the dashboard.

END OF DOCUMENT
