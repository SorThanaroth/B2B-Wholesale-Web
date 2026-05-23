import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/constants";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  info: "bg-accent-50 text-accent-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-red-50 text-red-600",
};

/** KPI tile for the dashboards (total revenue, orders, pending payments…). */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "info",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: BadgeTone;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-2xl font-bold text-slate-900">{value}</p>
        {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
