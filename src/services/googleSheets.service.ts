import { z } from 'zod';
import {
  SantriSchema,
  KehadiranSchema,
  TilawahSchema,
  TahfizSchema,
  DoaSchema,
  AdabSchema,
  CatatanGuruSchema,
  TargetPencapaianSchema,
  type SantriRow,
  type KehadiranRow,
  type TilawahRow,
  type TahfizRow,
  type DoaRow,
  type AdabRow,
  type CatatanGuruRow,
  type TargetPencapaianRow,
} from '@/types/database';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

/**
 * Helper function to fetch data from a specific range/worksheet via REST API.
 * Uses Next.js native fetch for optimal caching and edge compatibility.
 */
async function fetchAndValidateSheetData<T>(range: string, schema: z.ZodType<T>): Promise<T[]> {
  if (!SPREADSHEET_ID || !API_KEY) {
    throw new Error('SPREADSHEET_ID or GOOGLE_SHEETS_API_KEY is not defined in environment variables.');
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;

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
        
        // Handle common mapping aliases to align sheet data with Zod schema properties
        if (key === 'progres_tilawah') key = 'progress_tilawah';
        if (key === 'status_doa') key = 'status';
        if (key === 'jenis_kelamin') key = 'gender';
        
        // Only map status -> status_santri for the Santri range to prevent conflicts
        if (key === 'status' && range === 'Santri') {
          key = 'status_santri';
        }
        
        obj[key] = row[index] || '';
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

  async getKehadiranBySantri(id_santri: string): Promise<KehadiranRow[]> {
    const allKehadiran = await fetchAndValidateSheetData('Kehadiran', KehadiranSchema);
    return allKehadiran.filter(k => k.id_santri === id_santri);
  },

  async getTilawahBySantri(id_santri: string): Promise<TilawahRow[]> {
    const allTilawah = await fetchAndValidateSheetData('Tilawah', TilawahSchema);
    return allTilawah.filter(t => t.id_santri === id_santri);
  },

  async getTahfizBySantri(id_santri: string): Promise<TahfizRow[]> {
    const allTahfiz = await fetchAndValidateSheetData('Tahfizh', TahfizSchema);
    return allTahfiz.filter(t => t.id_santri === id_santri);
  },

  async getDoaBySantri(id_santri: string): Promise<DoaRow[]> {
    const allDoa = await fetchAndValidateSheetData('Doa', DoaSchema);
    return allDoa.filter(d => d.id_santri === id_santri);
  },

  async getAdabBySantri(id_santri: string): Promise<AdabRow[]> {
    const allAdab = await fetchAndValidateSheetData('Adab', AdabSchema);
    return allAdab.filter(a => a.id_santri === id_santri);
  },

  async getCatatanGuruBySantri(id_santri: string): Promise<CatatanGuruRow[]> {
    const allCatatan = await fetchAndValidateSheetData('Catatan_Guru', CatatanGuruSchema);
    const studentCatatan = allCatatan.filter(c => c.id_santri === id_santri);
    return studentCatatan.sort((a, b) => new Date(b.tanggal_catatan).getTime() - new Date(a.tanggal_catatan).getTime());
  },

  async getTargetPencapaianBySantri(id_santri: string): Promise<TargetPencapaianRow[]> {
    const allTargets = await fetchAndValidateSheetData('Target', TargetPencapaianSchema);
    return allTargets.filter(t => t.id_santri === id_santri);
  },
};
