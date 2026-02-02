interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 lg:mt-2">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
