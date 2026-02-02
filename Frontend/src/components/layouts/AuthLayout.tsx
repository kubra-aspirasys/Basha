import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-slate-50 to-gold-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-white/[0.02] -z-10" />
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div className="w-[500px] h-[500px] bg-gold-500/5 dark:bg-gold-500/10 rounded-full blur-3xl animate-pulse" />
      </div>
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img src="/logo-min.webp" alt="Basha Biryani Logo" className="h-24 mx-auto" />
        </div>
        <div className="animate-slide-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
