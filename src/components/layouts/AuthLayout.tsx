import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-slate-50 to-gold-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-white/[0.02] -z-10" />
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div className="w-[500px] h-[500px] bg-gold-500/5 dark:bg-gold-500/10 rounded-full blur-3xl animate-pulse" />
      </div>
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8 space-y-4">
          <img src="/assets/basha-logo.svg" alt="Basha Biryani Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
            Basha Biryani
          </h1>
          <p className="text-base font-medium text-slate-600 dark:text-slate-400 tracking-wide">
            Authentic Hyderabadi Flavors
          </p>
        </div>
        <div className="animate-slide-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
