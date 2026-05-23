import { api } from "@/lib/apiClient";
import { cleanParams } from "@/lib/utils";
import type {
  Category,
  CategoryRequest,
  Company,
  CompanyAdmin,
  CompanyRequest,
  ImportResult,
  PageResponse,
  Product,
  ProductQuery,
  ProductRequest,
} from "@/types/api";

/** Section 9.3 — Companies. */
export const companyService = {
  list: (params: { page?: number; size?: number; sort?: string }) =>
    api
      .get<PageResponse<Company>>("/companies", { params: cleanParams(params) })
      .then((r) => r.data),

  get: (id: string) => api.get<Company>(`/companies/${id}`).then((r) => r.data),

  create: (body: CompanyRequest) =>
    api.post<CompanyAdmin>("/companies", body).then((r) => r.data),

  update: (id: string, body: CompanyRequest) =>
    api.put<CompanyAdmin>(`/companies/${id}`, body).then((r) => r.data),

  deactivate: (id: string) => api.delete<void>(`/companies/${id}`).then((r) => r.data),
};

/** Section 9.4 — Categories (returned as a tree). */
export const categoryService = {
  tree: () => api.get<Category[]>("/categories").then((r) => r.data),

  get: (id: string) => api.get<Category>(`/categories/${id}`).then((r) => r.data),

  create: (body: CategoryRequest) => api.post<Category>("/categories", body).then((r) => r.data),

  update: (id: string, body: CategoryRequest) =>
    api.put<Category>(`/categories/${id}`, body).then((r) => r.data),

  delete: (id: string) => api.delete<void>(`/categories/${id}`).then((r) => r.data),
};

/** Section 9.5 — Products. */
export const productService = {
  list: (query: ProductQuery) =>
    api
      .get<PageResponse<Product>>("/products", { params: cleanParams(query) })
      .then((r) => r.data),

  get: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),

  byCompany: (companyId: string, params: { page?: number; size?: number }) =>
    api
      .get<PageResponse<Product>>(`/companies/${companyId}/products`, {
        params: cleanParams(params),
      })
      .then((r) => r.data),

  create: (body: ProductRequest) => api.post<Product>("/products", body).then((r) => r.data),

  update: (id: string, body: ProductRequest) =>
    api.put<Product>(`/products/${id}`, body).then((r) => r.data),

  deactivate: (id: string) => api.delete<void>(`/products/${id}`).then((r) => r.data),

  importCsv: (companyId: string, file: File) => {
    const form = new FormData();
    form.append("companyId", companyId);
    form.append("file", file);
    return api
      .post<ImportResult>("/products/import", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
