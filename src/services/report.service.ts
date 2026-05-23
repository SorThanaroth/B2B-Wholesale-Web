import { api } from "@/lib/apiClient";
import { cleanParams } from "@/lib/utils";
import type {
  AdminDashboard,
  MerchantActivityRow,
  MerchantDashboard,
  RevenueRow,
  TopProductRow,
} from "@/types/api";

/** Section 9.11 — dashboards & analytics reports. */
export const reportService = {
  merchantDashboard: () =>
    api.get<MerchantDashboard>("/users/me/dashboard").then((r) => r.data),

  adminDashboard: () => api.get<AdminDashboard>("/admin/dashboard").then((r) => r.data),

  revenue: (params: { from?: string; to?: string }) =>
    api
      .get<RevenueRow[]>("/admin/reports/revenue", { params: cleanParams(params) })
      .then((r) => r.data),

  topProducts: (limit = 10) =>
    api.get<TopProductRow[]>("/admin/reports/products", { params: { limit } }).then((r) => r.data),

  merchants: (limit = 10) =>
    api.get<MerchantActivityRow[]>("/admin/reports/merchants", { params: { limit } }).then((r) => r.data),
};
