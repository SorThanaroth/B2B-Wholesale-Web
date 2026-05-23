import type { Role } from "@/types/api";

/** Centralised route paths — import these instead of hard-coding URLs. */
export const ROUTES = {
  // Public / auth
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",

  // Merchant
  dashboard: "/app/dashboard",
  catalog: "/app/catalog",
  product: (id = ":id") => `/app/catalog/${id}`,
  cart: "/app/cart",
  checkout: "/app/checkout",
  payment: (orderId = ":orderId") => `/app/checkout/${orderId}/pay`,
  orders: "/app/orders",
  order: (id = ":id") => `/app/orders/${id}`,
  profile: "/app/profile",

  // Admin
  adminDashboard: "/admin/dashboard",
  adminCompanies: "/admin/companies",
  adminProducts: "/admin/products",
  adminCategories: "/admin/categories",
  adminUsers: "/admin/users",
  adminSuppliers: "/admin/suppliers",
  adminOrders: "/admin/orders",
  adminOrder: (id = ":id") => `/admin/orders/${id}`,
  adminSettlements: "/admin/settlements",
  adminReports: "/admin/reports",

  // Supplier portal
  supplierDashboard: "/supplier/dashboard",
  supplierProducts: "/supplier/products",
  supplierOrders: "/supplier/orders",
  supplierOrder: (id = ":id") => `/supplier/orders/${id}`,
  supplierSettlements: "/supplier/settlements",
  supplierCompany: "/supplier/company",
} as const;

/** The landing route for a given role after login / redirect. */
export function homeForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return ROUTES.adminDashboard;
    case "SUPPLIER":
      return ROUTES.supplierDashboard;
    default:
      return ROUTES.dashboard;
  }
}
