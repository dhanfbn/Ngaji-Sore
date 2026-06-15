'use client';

import { useState } from 'react';
import { User, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from '@/components/layout/Sidebar';

export function Header({ 
  studentName = 'Aisyah Putri', 
  studentClass = 'Kelas Anak', 
  studentPeriod = 'Periode: 1 – 31 Mei 2024' 
}: { 
  studentName?: string; 
  studentClass?: string; 
  studentPeriod?: string; 
}) {
  const [isOpen, setIsOpen] = useState(false);

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
              <SidebarContent onNavigate={() => setIsOpen(false)} />
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
            Laporan Progres <span className="hidden sm:inline">Belajar Ngaji Sore</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Ruang Belajar Quran Anak</p>
        </div>
      </div>

      {/* Right Section: Profile Card */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Desktop Full Profile Card */}
        <div 
          className="hidden lg:flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl p-2.5 pr-4 shadow-sm min-w-[300px] cursor-pointer hover:bg-slate-100 transition-colors"
          role="button"
          tabIndex={0}
          aria-label="Lihat profil santri"
        >
          <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center mr-3 shrink-0 border-2 border-blue-200">
            <User className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-[15px] leading-none mb-1.5 truncate">
              {studentName}
            </h3>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <span aria-hidden="true">🧑‍🤝‍🧑</span> {studentClass}
              </p>
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <span aria-hidden="true">📅</span> {studentPeriod}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet: Avatar only */}
        <button 
          className="flex lg:hidden btn-3d"
          aria-label="Lihat profil santri"
        >
          <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center border-2 border-blue-200">
            <User className="w-5 h-5" aria-hidden="true" />
          </div>
        </button>
      </div>
    </header>
  );
}
