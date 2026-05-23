import { useState } from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

/** Image avatar with a graceful initials fallback (used for users + company logos). */
export function Avatar({
  name,
  src,
  size = "md",
  square = false,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  square?: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const dimensions = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" }[size];
  const showImage = src && !errored;

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-brand-100 font-semibold text-brand-700",
        square ? "rounded-lg" : "rounded-full",
        dimensions,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
