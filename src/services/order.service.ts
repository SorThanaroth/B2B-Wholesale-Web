import { api } from "@/lib/apiClient";
import { cleanParams } from "@/lib/utils";
import type {
  AdminOrderQuery,
  OrderDetail,
  OrderSummary,
  PageResponse,
  QrResponse,
  UpdateOrderStatusRequest,
} from "@/types/api";

/** Section 9.7 — merchant orders + checkout. */
export const orderService = {
  checkout: () => api.post<QrResponse>("/orders/checkout").then((r) => r.data),

  myOrders: (params: { page?: number; size?: number; sort?: string }) =>
    api
      .get<PageResponse<OrderSummary>>("/orders", { params: cleanParams(params) })
      .then((r) => r.data),

  get: (id: string) => api.get<OrderDetail>(`/orders/${id}`).then((r) => r.data),

  /** Downloads the PDF invoice as a Blob (for paid orders). */
  invoice: (id: string) =>
    api.get<Blob>(`/orders/${id}/invoice`, { responseType: "blob" }).then((r) => r.data),
};

/** Section 9.7 — admin order management. */
export const adminOrderService = {
  list: (query: AdminOrderQuery) =>
    api
      .get<PageResponse<OrderSummary>>("/admin/orders", { params: cleanParams(query) })
      .then((r) => r.data),

  get: (id: string) => api.get<OrderDetail>(`/admin/orders/${id}`).then((r) => r.data),

  updateStatus: (id: string, body: UpdateOrderStatusRequest) =>
    api.put<OrderSummary>(`/admin/orders/${id}/status`, body).then((r) => r.data),
};
