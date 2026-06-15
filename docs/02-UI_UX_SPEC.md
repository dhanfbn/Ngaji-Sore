# UI / UX Specification

## Design Vision

The application should provide a fun, engaging, and motivating learning experience for both students and parents.

The interface should feel:

- Friendly
- Colorful
- Modern
- Child-Friendly
- Easy to understand

Design references:

- Duolingo
- Khan Academy Kids
- Ruangguru

Avoid:

- Corporate dashboard appearance
- Enterprise-style layouts
- Complex navigation

---

# Login Page

## Layout

Centered Card Layout

Components:

- Logo
- Application Title
- Application Subtitle
- ID Santri Input
- Tanggal Lahir Input
- Login Button

---

# Dashboard Layout

## Sidebar

Width:

280px

### Top Section

- Logo

### Navigation

- Ringkasan
- Kehadiran (Locked)
- Tilawah (Locked)
  - Iqro
  - Al Quran
- Tahfiz (Locked)
- Doa & Dzikir (Locked)
- Adab & Sikap (Locked)
- Catatan Guru (Locked)

### Bottom Section

- Logout Button
- Thank You Card

---

# Header

## Left

- Logo
- Application Title

## Right

Student Profile Card

Fields:

- Photo
- Nama
- Kelas
- Umur
- Periode Belajar

---

# KPI Section

Desktop:

4 Columns

Tablet:

2 Columns

Mobile:

1 Column

Cards:

- Kehadiran
- Tilawah
- Tahfiz
- Adab & Doa

Each card should display:

- Icon
- Percentage
- Label
- Progress Bar

---

# Main Content

## First Row

Left:

Progress Trend Chart

Right:

Current Achievement Table

---

## Second Row

Left:

Catatan Guru Card

Right:

Target Selanjutnya Table

---

# Empty States

Catatan Guru:

"Belum ada catatan dari guru."

Target Selanjutnya:

"Belum ada target berikutnya."

---

# Loading States

Use skeleton loading for:

- KPI Cards
- Charts
- Tables
- Profile Card