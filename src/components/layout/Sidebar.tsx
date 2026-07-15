'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  CalendarDays,
  BookOpen,
  RotateCcw,
  Type,
  GraduationCap,
  HeartHandshake,
  LogOut,
  Lock,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; // Required for accessibility if Title is hidden

const DAYCARE_KELAS = ['CLS001A', 'CLS002B', 'CLS003C'];
const TAUD_KELAS = ['CLS004D'];
const SD_KELAS = ['CLSSD01', 'CLSSD02', 'CLSSD03', 'CLSSD04', 'CLSSD05', 'CLSSD06'];

function getLogoSrc(kelasId?: string): string {
  const id = kelasId?.trim().toUpperCase();
  if (id && DAYCARE_KELAS.includes(id)) return '/Logo_Daycare.jpeg';
  if (id && TAUD_KELAS.includes(id)) return '/Logo_Taud.jpeg';
  if (id && SD_KELAS.includes(id)) return '/Logo_SD.jpeg';
  return '/logo.jpeg';
}

// v2 scope: only Ringkasan + Kehadiran are active; the other 5 KPI categories
// render locked until their detail pages are built.
const navItems = [
  { name: 'Ringkasan', icon: Home, href: '/dashboard', locked: false },
  { name: 'Kehadiran', icon: CalendarDays, href: '#', locked: true },
  { name: 'Ziyadah', icon: BookOpen, href: '#', locked: true },
  { name: 'Murojaah', icon: RotateCcw, href: '#', locked: true },
  { name: 'Tibyan', icon: Type, href: '#', locked: true },
  { name: 'Tarbiyyah', icon: GraduationCap, href: '#', locked: true },
  { name: 'Adab Harian', icon: HeartHandshake, href: '#', locked: true },
];

function SidebarContent({ onNavigate, kelasId }: { onNavigate?: () => void; kelasId?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full bg-[#faf9f7] shadow-sm">
      {/* Logo Section */}
      <div className="p-6 flex flex-col items-center border-b border-slate-50">
        <img className="w-48 h-48" src={getLogoSrc(kelasId)} alt="logo" />
        {/* <div className="flex items-center justify-center w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full mb-3 text-2xl">
          <img src="logo.jpeg" alt="logo" />
        </div> */}
        {/* <h2 className="font-poppins font-bold text-lg text-slate-800 tracking-tight text-center leading-tight">
          KISFA
        </h2> */}
        {/* <p className="font-nunito text-xs text-green-600 font-semibold mt-1">Belajar • Mengaji • Berkah</p> */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <div key={item.name}>
              {item.locked ? (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed bg-slate-50 opacity-60">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-nunito font-semibold">{item.name}</span>
                  </div>
                  <Lock className="w-4 h-4 text-slate-300" />
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`btn-3d flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive
                    ? 'bg-brand-green text-white font-bold'
                    : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-2 border-transparent hover:border-slate-100 font-semibold'
                    }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="font-nunito text-[15px]">{item.name}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="bg-brand-green/10 rounded-2xl p-4 text-center mb-4 border-2 border-brand-green/20">
          <div className="text-3xl mb-2" aria-hidden="true">👨‍👩‍👧‍👦</div>
          <p className="font-nunito font-bold text-slate-800 text-sm mb-1">Aba Ummah</p>
          <p className="font-nunito text-xs text-slate-500 leading-relaxed">
            Terimakasih atas dukungan Aba &  Ummah. Semangat belajar hari ini, untuk bekal di akhirat nanti 💚
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="btn-3d w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl px-4 py-3 font-nunito font-bold border-2 border-red-100 transition-colors"
          aria-label="Keluar dari aplikasi"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ kelasId }: { kelasId?: string }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-[280px] hidden md:flex flex-col h-screen border-r border-slate-100 sticky top-0 shrink-0">
        <SidebarContent kelasId={kelasId} />
      </aside>

      {/* Mobile Sidebar Trigger is in Header, but we render the Sheet structure here if preferred. 
          Actually, let's keep Mobile Sidebar Trigger in Header for structural CSS ease, and just export SidebarContent there, 
          OR we can place the mobile button absolutely if we want to contain it. We'll export SidebarContent to use in Header.tsx. */}
    </>
  );
}

// Export SidebarContent so Header can wrap it in a Sheet
export { SidebarContent };
