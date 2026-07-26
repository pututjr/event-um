export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-navy to-navy-light p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-white/15 text-white">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
