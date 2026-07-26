export function ContentCard({
  children,
  className = "",
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${
        padded ? "p-6" : ""
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
