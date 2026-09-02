import { z } from 'zod';
import {
  SantriSchema,
  KelasSchema,
  GuruSchema,
  MasterSurahSchema,
  KehadiranSchema,
  ZiyadahSchema,
  MurojaahSchema,
  TibyanSchema,
  TarbiyyahSchema,
  AdabHarianSchema,
  LessonPlanMingguanSchema,
  CatatanAnakSchema,
  TugasRumahSchema,
  ProgresMingguanSchema,
  type SantriRow,
  type KelasRow,
  type GuruRow,
  type MasterSurahRow,
  type KehadiranRow,
  type ZiyadahRow,
  type MurojaahRow,
  type TibyanRow,
  type TarbiyyahRow,
  type AdabHarianRow,
  type LessonPlanMingguanRow,
  type CatatanAnakRow,
  type TugasRumahRow,
  type ProgresMingguanRow,
} from '@/types/database';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

// The actual tab in the spreadsheet has a trailing space in its name.
const RANGE_PROGRES_MINGGUAN = 'Progres_Mingguan ';

// The Adab_Harian tab was renamed to "Lain-lain" directly in the spreadsheet
// at some point — never updated here, so getAdabHarianBySantri has silently
// returned an empty array in production until this was found while building
// the Postgres migration script. Column headers still match AdabHarianSchema.
const RANGE_ADAB_HARIAN = 'Lain-lain';

/**
 * Helper function to fetch data from a specific range/worksheet via REST API.
 * Uses Next.js native fetch for optimal caching and edge compatibility.
 */
async function fetchAndValidateSheetData<T>(range: string, schema: z.ZodType<T>): Promise<T[]> {
  if (!SPREADSHEET_ID || !API_KEY) {
    throw new Error('SPREADSHEET_ID or GOOGLE_SHEETS_API_KEY is not defined in environment variables.');
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`;

    // Leverage Next.js fetch cache. Revalidate every 5 minutes (300 seconds)
    const response = await fetch(url, {
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google Sheets API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length === 0) {
      return [];
    }

    // Assume the first row contains headers
    const headers = rows[0] as string[];
    const dataRows = rows.slice(1);

    // Map rows to objects using headers as keys
    const rawObjects = dataRows.map((row: string[]) => {
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        // Safe parsing: standardize header names to lowercase snake_case and handle empty cells
        let key = header.toLowerCase().trim().replace(/ /g, '_');

        // Only map status -> status_santri for the Santri range to prevent conflicts
        if (key === 'status' && range === 'Santri') {
          key = 'status_santri';
        }
        // Guru sheet's status column is just "status" too, but GuruSchema expects status_guru
        if (key === 'status' && range === 'Guru') {
          key = 'status_guru';
        }

        // Santri sheet columns were renamed (nama -> nama_santri, gender -> jenis_kelamin)
        if (range === 'Santri' && key === 'nama_santri') {
          key = 'nama';
        }
        if (range === 'Santri' && key === 'jenis_kelamin') {
          key = 'gender';
        }

        obj[key] = typeof row[index] === 'string' ? row[index].trim() : (row[index] || '');
      });
      return obj;
    });

    // Validate and coerce types at runtime using Zod
    const validatedData = z.array(schema).safeParse(rawObjects);

    if (!validatedData.success) {
      console.error(`Validation failed for sheet [${range}]:`, validatedData.error.format());
      // Filter out invalid rows to prevent total crash
      return rawObjects.map((obj: Record<string, unknown>) => {
        const parsed = schema.safeParse(obj);
        return parsed.success ? parsed.data : null;
      }).filter((item: T | null): item is T => item !== null);
    }

    return validatedData.data;

  } catch (error) {
    console.error(`Error fetching or validating sheet data for range ${range}:`, error);
    // Return empty array instead of throwing to prevent complete dashboard crash
    return [];
  }
}

/**
 * Google Sheets Service Layer
 * Abstracts data access and provides strongly typed methods to fetch and validate sheet data.
 */
export const googleSheetsService = {

  async getSantriById(id_santri: string): Promise<SantriRow | null> {
    const allSantri = await fetchAndValidateSheetData('Santri', SantriSchema);
    return allSantri.find(s => s.id_santri === id_santri) || null;
  },

  async getKelasById(id_kelas: string): Promise<KelasRow | null> {
    const allKelas = await fetchAndValidateSheetData('Kelas', KelasSchema);
    return allKelas.find(k => k.id_kelas === id_kelas) || null;
  },

  async getMasterSurah(): Promise<MasterSurahRow[]> {
    return fetchAndValidateSheetData('Master_surah', MasterSurahSchema);
  },

  async getSurahById(id_surah: string): Promise<MasterSurahRow | null> {
    const allSurah = await this.getMasterSurah();
    return allSurah.find(s => s.id_surah === id_surah) || null;
  },

  async getKehadiranBySantri(id_santri: string): Promise<KehadiranRow[]> {
    const allKehadiran = await fetchAndValidateSheetData('Kehadiran', KehadiranSchema);
    return allKehadiran.filter(k => k.id_santri === id_santri);
  },

  async getZiyadahBySantri(id_santri: string): Promise<ZiyadahRow[]> {
    const allZiyadah = await fetchAndValidateSheetData('Ziyadah', ZiyadahSchema);
    return allZiyadah.filter(z => z.id_santri === id_santri);
  },

  async getMurojaahBySantri(id_santri: string): Promise<MurojaahRow[]> {
    const allMurojaah = await fetchAndValidateSheetData('Murojaah', MurojaahSchema);
    return allMurojaah.filter(m => m.id_santri === id_santri);
  },

  async getTibyanBySantri(id_santri: string): Promise<TibyanRow[]> {
    const allTibyan = await fetchAndValidateSheetData('Tibyan', TibyanSchema);
    return allTibyan.filter(t => t.id_santri === id_santri);
  },

  async getTarbiyyahBySantri(id_santri: string): Promise<TarbiyyahRow[]> {
    const allTarbiyyah = await fetchAndValidateSheetData('Tarbiyyah', TarbiyyahSchema);
    return allTarbiyyah.filter(t => t.id_santri === id_santri);
  },

  async getAdabHarianBySantri(id_santri: string): Promise<AdabHarianRow[]> {
    const allAdab = await fetchAndValidateSheetData(RANGE_ADAB_HARIAN, AdabHarianSchema);
    return allAdab.filter(a => a.id_santri === id_santri);
  },

  async getLessonPlanByKelas(id_kelas: string): Promise<LessonPlanMingguanRow[]> {
    const allPlans = await fetchAndValidateSheetData('Lesson_Plan_Mingguan', LessonPlanMingguanSchema);
    return allPlans.filter(p => p.id_kelas === id_kelas);
  },

  async getCatatanAnakBySantri(id_santri: string): Promise<CatatanAnakRow[]> {
    const allCatatan = await fetchAndValidateSheetData('Catatan_Anak', CatatanAnakSchema);
    return allCatatan.filter(c => c.id_santri === id_santri);
  },

  async getTugasRumahBySantri(id_santri: string): Promise<TugasRumahRow[]> {
    const allTugas = await fetchAndValidateSheetData('Tugas_Rumah', TugasRumahSchema);
    return allTugas.filter(t => t.id_santri === id_santri);
  },

  async getProgresMingguanBySantri(id_santri: string): Promise<ProgresMingguanRow[]> {
    const allProgres = await fetchAndValidateSheetData(RANGE_PROGRES_MINGGUAN, ProgresMingguanSchema);
    return allProgres.filter(p => p.id_santri === id_santri);
  },

  // ── Additive "fetch whole tab" helpers for scripts/migrate-to-postgres.ts.
  // Not consumed by dashboard.service.ts — kept separate from the getXBySantri
  // methods above so their signatures stay untouched.

  async getAllSantri(): Promise<SantriRow[]> {
    return fetchAndValidateSheetData('Santri', SantriSchema);
  },

  async getAllKelas(): Promise<KelasRow[]> {
    return fetchAndValidateSheetData('Kelas', KelasSchema);
  },

  async getAllGuru(): Promise<GuruRow[]> {
    return fetchAndValidateSheetData('Guru', GuruSchema);
  },

  async getAllKehadiran(): Promise<KehadiranRow[]> {
    return fetchAndValidateSheetData('Kehadiran', KehadiranSchema);
  },

  async getAllZiyadah(): Promise<ZiyadahRow[]> {
    return fetchAndValidateSheetData('Ziyadah', ZiyadahSchema);
  },

  async getAllMurojaah(): Promise<MurojaahRow[]> {
    return fetchAndValidateSheetData('Murojaah', MurojaahSchema);
  },

  async getAllTibyan(): Promise<TibyanRow[]> {
    return fetchAndValidateSheetData('Tibyan', TibyanSchema);
  },

  async getAllTarbiyyah(): Promise<TarbiyyahRow[]> {
    return fetchAndValidateSheetData('Tarbiyyah', TarbiyyahSchema);
  },

  async getAllAdabHarian(): Promise<AdabHarianRow[]> {
    return fetchAndValidateSheetData(RANGE_ADAB_HARIAN, AdabHarianSchema);
  },

  async getAllLessonPlan(): Promise<LessonPlanMingguanRow[]> {
    return fetchAndValidateSheetData('Lesson_Plan_Mingguan', LessonPlanMingguanSchema);
  },

  async getAllCatatanAnak(): Promise<CatatanAnakRow[]> {
    return fetchAndValidateSheetData('Catatan_Anak', CatatanAnakSchema);
  },

  async getAllTugasRumah(): Promise<TugasRumahRow[]> {
    return fetchAndValidateSheetData('Tugas_Rumah', TugasRumahSchema);
  },

  async getAllProgresMingguan(): Promise<ProgresMingguanRow[]> {
    return fetchAndValidateSheetData(RANGE_PROGRES_MINGGUAN, ProgresMingguanSchema);
  },
};
