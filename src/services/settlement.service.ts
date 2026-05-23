import { api } from "@/lib/apiClient";
import { cleanParams } from "@/lib/utils";
import type { PageResponse, Settlement, SettlementQuery } from "@/types/api";

/** Section 9.9 — Settlements (admin only). */
export const settlementService = {
  list: (query: SettlementQuery) =>
    api
      .get<PageResponse<Settlement>>("/admin/settlements", { params: cleanParams(query) })
      .then((r) => r.data),

  forOrder: (orderId: string) =>
    api.get<Settlement[]>(`/admin/settlements/${orderId}`).then((r) => r.data),

  settle: (splitId: string) =>
    api.put<Settlement>(`/admin/settlements/${splitId}/settle`).then((r) => r.data),

  /** Exports the filtered settlement list as CSV (Blob). */
  reportCsv: (query: Omit<SettlementQuery, "page" | "size">) =>
    api
      .get<Blob>("/admin/settlements/report", {
        params: cleanParams(query),
        responseType: "blob",
      })
      .then((r) => r.data),
};
