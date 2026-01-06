import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PWAInstallPrompt from '../PWAInstallPrompt';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-white/[0.02] -z-10" />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <PWAInstallPrompt />
    </div>
  );
}
