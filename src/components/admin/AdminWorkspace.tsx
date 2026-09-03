'use client';

import { useState } from 'react';
import { AdminTabs, type AdminTabKey } from './AdminTabs';
import { AdminLogoutButton } from './LogoutButton';
import { GuruAdminPanel } from './GuruAdminPanel';
import { SantriAdminPanel } from './SantriAdminPanel';
import { KelasAdminPanel } from './KelasAdminPanel';
import { LessonPlanAdminPanel } from './LessonPlanAdminPanel';

interface AdminWorkspaceProps {
  adminNama: string;
}

export function AdminWorkspace({ adminNama }: AdminWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<AdminTabKey>('guru');

  return (
    <div className="min-h-screen bg-[#faf9f7] p-4 sm:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800 font-poppins">Panel Admin — {adminNama}</h1>
          <AdminLogoutButton />
        </div>

        <AdminTabs active={activeTab} onChange={setActiveTab} />

        <div className="mt-4">
          {activeTab === 'guru' && <GuruAdminPanel />}
          {activeTab === 'santri' && <SantriAdminPanel />}
          {activeTab === 'kelas' && <KelasAdminPanel />}
          {activeTab === 'lesson-plan' && <LessonPlanAdminPanel />}
        </div>
      </div>
    </div>
  );
}
