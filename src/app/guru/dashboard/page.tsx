import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { GuruEntryWorkspace } from '@/components/guru/GuruEntryWorkspace';

export default async function GuruDashboardPage() {
  const session = await getSession();

  if (!session || !session.user || (session.user.role ?? 'santri') !== 'guru') {
    redirect('/login-guru');
  }

  const kelasList = await prisma.kelas.findMany({
    where: { id_guru: session.user.id },
    orderBy: { nama_kelas: 'asc' },
    select: { id_kelas: true, nama_kelas: true },
  });

  return <GuruEntryWorkspace guruNama={session.user.nama} kelasList={kelasList} />;
}
