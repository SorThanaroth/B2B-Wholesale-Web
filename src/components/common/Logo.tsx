import { PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Brand wordmark + glyph. `compact` shows just the icon (collapsed sidebar). */
export function Logo({
  compact = false,
  light = false,
  className,
}: {
  compact?: boolean;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-white shadow-sm">
        <PackageCheck className="h-5 w-5" />
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className={cn("text-sm font-bold", light ? "text-white" : "text-slate-900")}>
            B2B Wholesale
          </p>
          <p className={cn("text-[11px]", light ? "text-brand-200" : "text-slate-400")}>
            Marketplace
          </p>
        </div>
      )}
    </div>
  );
}
