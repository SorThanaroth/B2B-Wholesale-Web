import { api } from "@/lib/apiClient";
import { cleanParams } from "@/lib/utils";
import type {
  Company,
  ImportResult,
  OrderStatus,
  PageResponse,
  Product,
  Settlement,
  SplitStatus,
  SupplierDashboard,
  SupplierOrderDetail,
  SupplierOrderRow,
  SupplierProductRequest,
} from "@/types/api";

/** Supplier portal API (v1.1) — every call is company-scoped server-side. */
export const supplierService = {
  myCompany: () => api.get<Company>("/supplier/me/company").then((r) => r.data),

  dashboard: () => api.get<SupplierDashboard>("/supplier/dashboard").then((r) => r.data),

  // Products (own company)
  listProducts: (params: { search?: string; page?: number; size?: number }) =>
    api
      .get<PageResponse<Product>>("/supplier/products", { params: cleanParams(params) })
      .then((r) => r.data),

  createProduct: (body: SupplierProductRequest) =>
    api.post<Product>("/supplier/products", body).then((r) => r.data),

  updateProduct: (id: string, body: SupplierProductRequest) =>
    api.put<Product>(`/supplier/products/${id}`, body).then((r) => r.data),

  deactivateProduct: (id: string) =>
    api.delete<void>(`/supplier/products/${id}`).then((r) => r.data),

  importProducts: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<ImportResult>("/supplier/products/import", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  // Orders (containing own products)
  listOrders: (params: { status?: OrderStatus; page?: number; size?: number }) =>
    api
      .get<PageResponse<SupplierOrderRow>>("/supplier/orders", { params: cleanParams(params) })
      .then((r) => r.data),

  getOrder: (id: string) =>
    api.get<SupplierOrderDetail>(`/supplier/orders/${id}`).then((r) => r.data),

  // Settlements (own company)
  listSettlements: (params: { status?: SplitStatus; page?: number; size?: number }) =>
    api
      .get<PageResponse<Settlement>>("/supplier/settlements", { params: cleanParams(params) })
      .then((r) => r.data),
};
