'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { User, Menu, Calendar, BookOpen, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from '@/components/layout/Sidebar';
import type { WeekOption } from '@/types/dashboard';

interface HeaderProps {
  studentName?: string;
  kelasNama?: string;
  kelasId?: string;
  weeks?: WeekOption[];
  defaultWeek?: string;
  semester?: string;
}

function PeriodeSelect({ weeks, selectedWeek, onChange }: { weeks: WeekOption[]; selectedWeek: string; onChange: (key: string) => void }) {
  if (weeks.length === 0) {
    return <span>Belum tersedia</span>;
  }

  return (
    <select
      value={selectedWeek}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-green/40 rounded cursor-pointer -ml-0.5"
      aria-label="Pilih minggu"
    >
      {weeks.map(w => (
        <option key={w.key} value={w.key}>{w.label}</option>
      ))}
    </select>
  );
}

function ProfileFields({ studentName, kelasNama, semester, weeks, selectedWeek, onWeekChange }: {
  studentName: string;
  kelasNama: string;
  semester: string;
  weeks: WeekOption[];
  selectedWeek: string;
  onWeekChange: (key: string) => void;
}) {
  return (
    <>
      <p className="text-xs text-slate-600">
        <span className="font-bold text-slate-800">Nama Anak</span> : {studentName}
      </p>
      <p className="text-xs text-slate-600 flex items-center gap-2">
        <span className="font-bold text-slate-800">Kelas</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
          {kelasNama}
        </span>
      </p>
      <p className="text-xs text-slate-600 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
        <span className="font-bold text-slate-800">Periode</span> : <PeriodeSelect weeks={weeks} selectedWeek={selectedWeek} onChange={onWeekChange} />
      </p>
      <p className="text-xs text-slate-600 flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
        <span className="font-bold text-slate-800">Semester</span> : {semester}
      </p>
    </>
  );
}

export function Header({
  studentName = 'Aisyah Putri',
  kelasNama = 'Kelas Anak',
  kelasId,
  weeks = [],
  defaultWeek = '',
  semester = '-',
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedWeek = searchParams.get('minggu') ?? defaultWeek;

  const handleWeekChange = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('minggu', key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="h-[80px] md:h-[100px] flex items-center justify-between px-4 md:px-8 bg-white border-b border-border sticky top-0 z-10 shrink-0 shadow-sm">
      {/* Left Section: Mobile Menu Trigger + App Title */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        {/* Mobile Hamburger Menu */}
        <div className="md:hidden shrink-0">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-white hover:bg-muted transition-colors"
              aria-label="Buka menu navigasi"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]" showCloseButton={false}>
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SidebarContent onNavigate={() => setIsOpen(false)} kelasId={kelasId} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Logo Icon */}
        <div className="hidden md:flex w-12 h-12 bg-accent rounded-xl items-center justify-center text-2xl shadow-sm border border-border shrink-0">
          📖
        </div>

        {/* App Title */}
        <div className="min-w-0">
          <h1 className="font-bold text-base md:text-2xl text-foreground tracking-tight truncate">
            Laporan Progres Belajar Anak
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Belajar Bersama, Tumbuh Bersama</p>
        </div>
      </div>

      {/* Right Section: Profile Card */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Desktop: full profile details, always expanded */}
        <div className="hidden lg:grid grid-cols-2 gap-x-6 gap-y-1.5 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 shadow-sm min-w-[340px]">
          <ProfileFields studentName={studentName} kelasNama={kelasNama} semester={semester} weeks={weeks} selectedWeek={selectedWeek} onWeekChange={handleWeekChange} />
        </div>

        {/* Mobile/Tablet: avatar toggles an expand/collapse panel */}
        <div className="lg:hidden relative">
          <button
            className="btn-3d flex items-center gap-1"
            aria-label="Lihat profil santri"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen(o => !o)}
          >
            <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center border-2 border-blue-200">
              <User className="w-5 h-5" aria-hidden="true" />
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[260px] bg-white border-2 border-slate-100 rounded-2xl shadow-lg p-4 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <ProfileFields studentName={studentName} kelasNama={kelasNama} semester={semester} weeks={weeks} selectedWeek={selectedWeek} onWeekChange={handleWeekChange} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
