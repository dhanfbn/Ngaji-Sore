import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { createSession } from '@/lib/session';
import { z } from 'zod';

const LoginAdminSchema = z.object({
  id_admin: z.string().min(1, 'ID Admin diperlukan'),
  password: z.string().min(1, 'Password diperlukan'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginAdminSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
      }, { status: 400 });
    }

    const { id_admin, password } = parsed.data;

    const admin = await prisma.admin.findUnique({ where: { id_admin } });

    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'ID Admin tidak ditemukan.',
      }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({
        success: false,
        message: 'Password salah.',
      }, { status: 401 });
    }

    await createSession({
      id: admin.id_admin,
      nama: admin.nama,
      role: 'admin',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id_admin,
        nama: admin.nama,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan pada server. Coba lagi nanti.',
    }, { status: 500 });
  }
}
