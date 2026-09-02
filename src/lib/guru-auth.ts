import { getSession } from '@/lib/session';

export async function requireGuru(): Promise<{ id: string; nama: string } | null> {
  const session = await getSession();
  if (!session?.user || (session.user.role ?? 'santri') !== 'guru') {
    return null;
  }
  return { id: session.user.id, nama: session.user.nama };
}
