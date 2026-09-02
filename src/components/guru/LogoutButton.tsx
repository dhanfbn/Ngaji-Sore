'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function GuruLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login-guru');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="btn-3d flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl px-6 py-3 font-nunito font-bold border-2 border-red-100 transition-colors"
      aria-label="Keluar dari aplikasi"
    >
      <LogOut className="w-5 h-5" aria-hidden="true" />
      <span>Keluar</span>
    </button>
  );
}
