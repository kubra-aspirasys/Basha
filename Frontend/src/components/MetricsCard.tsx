import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  onClick?: () => void;
}

export default function MetricsCard({ title, value, icon: Icon, trend, onClick }: MetricsCardProps) {
  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 premium-shadow hover-lift transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {title}
            </p>
            <p className="text-4xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mt-3 mb-2">
              {value}
            </p>
            {trend && (
              <div
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  trend.positive
                    ? 'bg-success/10 dark:bg-success/20 text-success dark:text-success'
                    : 'bg-error/10 dark:bg-error/20 text-error dark:text-error'
                }`}
              >
                {trend.positive ? (
                  <TrendingUp className="w-3.5 h-3.5" strokeWidth={3} />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" strokeWidth={3} />
                )}
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-0 gradient-primary rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative flex items-center justify-center w-14 h-14 gradient-primary rounded-2xl premium-shadow-lg">
              <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}
