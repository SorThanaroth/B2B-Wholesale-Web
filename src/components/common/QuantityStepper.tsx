import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Numeric quantity control that respects a wholesale minimum (`min`). */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}) {
  const clamp = (n: number) => {
    let v = Number.isNaN(n) ? min : n;
    if (max !== undefined) v = Math.min(v, max);
    return Math.max(min, v);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-slate-300 bg-white",
        disabled && "opacity-60",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-l-lg text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(clamp(parseInt(e.target.value, 10)))}
        className="h-9 w-14 border-x border-slate-200 text-center text-sm font-medium text-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || (max !== undefined && value >= max)}
        className="flex h-9 w-9 items-center justify-center rounded-r-lg text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
