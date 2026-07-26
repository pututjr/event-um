export type StatColor = "blue" | "purple" | "green" | "pink";

const colorClasses: Record<StatColor, { bg: string; border: string; icon: string }> = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: "bg-blue-600",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-100",
    icon: "bg-purple-600",
  },
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    icon: "bg-emerald-600",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-100",
    icon: "bg-pink-600",
  },
};

export function StatCard({
  label,
  value,
  icon,
  color = "blue",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: StatColor;
}) {
  const c = colorClasses[color];
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border ${c.border} ${c.bg} p-5 shadow-sm`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${c.icon} text-white`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}
