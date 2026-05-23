import { Truck } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { SUPPLIER_NAV } from "./navigation";

export function SupplierLayout() {
  return (
    <DashboardLayout
      nav={SUPPLIER_NAV}
      topbarRight={
        <span className="hidden items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-accent-700 sm:flex">
          <Truck className="h-3.5 w-3.5" />
          Supplier portal
        </span>
      }
    />
  );
}
