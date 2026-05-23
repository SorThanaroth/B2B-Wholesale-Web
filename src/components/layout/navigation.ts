import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingBag,
  Store,
  Truck,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Exact-match highlighting (used for index routes). */
  end?: boolean;
}

export const MERCHANT_NAV: NavItem[] = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.catalog, label: "Catalog", icon: Store },
  { to: ROUTES.cart, label: "Cart", icon: ShoppingBag },
  { to: ROUTES.orders, label: "Orders", icon: Receipt },
  { to: ROUTES.profile, label: "Profile", icon: UserCircle },
];

export const ADMIN_NAV: NavItem[] = [
  { to: ROUTES.adminDashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.adminCompanies, label: "Companies", icon: Building2 },
  { to: ROUTES.adminProducts, label: "Products", icon: Package },
  { to: ROUTES.adminCategories, label: "Categories", icon: FolderTree },
  { to: ROUTES.adminUsers, label: "Merchants", icon: Users },
  { to: ROUTES.adminSuppliers, label: "Suppliers", icon: Truck },
  { to: ROUTES.adminOrders, label: "Orders", icon: ClipboardList },
  { to: ROUTES.adminSettlements, label: "Settlements", icon: Wallet },
  { to: ROUTES.adminReports, label: "Reports", icon: Receipt },
];

export const SUPPLIER_NAV: NavItem[] = [
  { to: ROUTES.supplierDashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.supplierProducts, label: "My Products", icon: Package },
  { to: ROUTES.supplierOrders, label: "Orders", icon: ClipboardList },
  { to: ROUTES.supplierSettlements, label: "Settlements", icon: Wallet },
  { to: ROUTES.supplierCompany, label: "My Company", icon: Building2 },
];
