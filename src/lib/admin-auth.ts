import { getSession } from '@/lib/session';

export async function requireAdmin(): Promise<{ id: string; nama: string } | null> {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }
  return { id: session.user.id, nama: session.user.nama };
}
