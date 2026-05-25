import { QueryClient } from "@tanstack/react-query";

/** Shared React Query client. Sensible defaults for a CRUD-heavy dashboard. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Centralised query keys — avoids stringly-typed cache invalidation bugs. */
export const queryKeys = {
  profile: ["profile"] as const,
  addresses: ["addresses"] as const,
  merchantDashboard: ["merchant-dashboard"] as const,
  adminDashboard: ["admin-dashboard"] as const,
  companies: (params?: unknown) => ["companies", params] as const,
  company: (id: string) => ["company", id] as const,
  companyAdmin: (id: string) => ["company-admin", id] as const,
  categories: ["categories"] as const,
  products: (params?: unknown) => ["products", params] as const,
  product: (id: string) => ["product", id] as const,
  cart: ["cart"] as const,
  orders: (params?: unknown) => ["orders", params] as const,
  order: (id: string) => ["order", id] as const,
  paymentStatus: (orderId: string) => ["payment-status", orderId] as const,
  qr: (orderId: string) => ["qr", orderId] as const,
  adminOrders: (params?: unknown) => ["admin-orders", params] as const,
  adminOrder: (id: string) => ["admin-order", id] as const,
  adminUsers: (params?: unknown) => ["admin-users", params] as const,
  adminUser: (id: string) => ["admin-user", id] as const,
  settlements: (params?: unknown) => ["settlements", params] as const,
  reportRevenue: (params?: unknown) => ["report-revenue", params] as const,
  reportProducts: (limit: number) => ["report-products", limit] as const,
  reportMerchants: (limit: number) => ["report-merchants", limit] as const,

  // Supplier portal
  supplierDashboard: ["supplier-dashboard"] as const,
  supplierCompany: ["supplier-company"] as const,
  supplierProducts: (params?: unknown) => ["supplier-products", params] as const,
  supplierOrders: (params?: unknown) => ["supplier-orders", params] as const,
  supplierOrder: (id: string) => ["supplier-order", id] as const,
  supplierSettlements: (params?: unknown) => ["supplier-settlements", params] as const,
};
