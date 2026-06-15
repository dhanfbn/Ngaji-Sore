import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/services/googleSheets.service';
import { createSession } from '@/lib/session';
import { z } from 'zod';

const LoginSchema = z.object({
  id_santri: z.string().min(1, 'ID Santri diperlukan'),
  tanggal_lahir: z.string().min(1, 'Tanggal Lahir diperlukan'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid input' 
      }, { status: 400 });
    }

    const { id_santri, tanggal_lahir } = parsed.data;

    // Fetch student from Google Sheets
    const student = await googleSheetsService.getSantriById(id_santri);

    // Validate credentials
    if (!student) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID Santri tidak ditemukan.' 
      }, { status: 401 });
    }

    // Since we don't strictly know the date format (e.g. DD/MM/YYYY vs YYYY-MM-DD),
    // we should just do a strict string comparison or basic sanitization. 
    // Assuming exact string match for MVP based on PRD requirements.
    if (student.tanggal_lahir !== tanggal_lahir) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tanggal Lahir tidak cocok.' 
      }, { status: 401 });
    }

    // Create secure HTTP-only cookie session
    await createSession({
      id: student.id_santri,
      nama: student.nama,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: student.id_santri,
        nama: student.nama,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server. Coba lagi nanti.' 
    }, { status: 500 });
  }
}
