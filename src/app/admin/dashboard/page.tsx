import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { AdminWorkspace } from '@/components/admin/AdminWorkspace';

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || !session.user || session.user.role !== 'admin') {
    redirect('/login-admin');
  }

  return <AdminWorkspace adminNama={session.user.nama} />;
}
