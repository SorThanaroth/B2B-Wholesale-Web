import { ShieldCheck } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { ADMIN_NAV } from "./navigation";

export function AdminLayout() {
  return (
    <DashboardLayout
      nav={ADMIN_NAV}
      topbarRight={
        <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 sm:flex">
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin console
        </span>
      }
    />
  );
}
