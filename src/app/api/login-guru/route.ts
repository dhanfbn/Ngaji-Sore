import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { createSession } from '@/lib/session';
import { z } from 'zod';

const LoginGuruSchema = z.object({
  id_guru: z.string().min(1, 'ID Guru diperlukan'),
  password: z.string().min(1, 'Password diperlukan'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginGuruSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
      }, { status: 400 });
    }

    const { id_guru, password } = parsed.data;

    const guru = await prisma.guru.findUnique({ where: { id_guru } });

    if (!guru) {
      return NextResponse.json({
        success: false,
        message: 'ID Guru tidak ditemukan.',
      }, { status: 401 });
    }

    if (!guru.password_hash) {
      return NextResponse.json({
        success: false,
        message: 'Password belum diatur, hubungi admin.',
      }, { status: 401 });
    }

    const valid = await verifyPassword(password, guru.password_hash);
    if (!valid) {
      return NextResponse.json({
        success: false,
        message: 'Password salah.',
      }, { status: 401 });
    }

    await createSession({
      id: guru.id_guru,
      nama: guru.nama_guru,
      role: 'guru',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: guru.id_guru,
        nama: guru.nama_guru,
      },
    });
  } catch (error) {
    console.error('Guru login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan pada server. Coba lagi nanti.',
    }, { status: 500 });
  }
}
