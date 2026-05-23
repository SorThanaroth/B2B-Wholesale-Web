import type { ReactNode } from "react";
import { QrCode, Layers, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const HIGHLIGHTS = [
  { icon: Layers, text: "Browse and order from every supplier in one catalog" },
  { icon: QrCode, text: "Pay all vendors at once with a single unified QR scan" },
  { icon: ShieldCheck, text: "Automatic, itemised settlement to each company" },
];

/** Split-screen wrapper shared by all auth screens (brand panel + form panel). */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-800 p-12 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #5dc1d6 0, transparent 40%), radial-gradient(circle at 80% 70%, #345d94 0, transparent 45%)",
          }}
        />
        <div className="relative">
          <Logo light />
        </div>
        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Multi-vendor wholesale, <br /> one unified checkout.
            </h2>
            <p className="mt-3 max-w-md text-brand-100">
              The merchant-only marketplace that consolidates procurement across all your
              suppliers — order once, pay once, settle automatically.
            </p>
          </div>
          <ul className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-5 w-5 text-accent-200" />
                </span>
                <span className="text-sm text-brand-50">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-brand-200">
          © {new Date().getFullYear()} B2B Wholesale Marketplace — MVP
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
