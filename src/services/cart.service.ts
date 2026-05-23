import { api } from "@/lib/apiClient";
import type { AddItemRequest, Cart, UpdateItemRequest } from "@/types/api";

/** Section 9.6 — the authenticated merchant's active cart. */
export const cartService = {
  get: () => api.get<Cart>("/cart").then((r) => r.data),

  addItem: (body: AddItemRequest) => api.post<Cart>("/cart/items", body).then((r) => r.data),

  updateItem: (id: string, body: UpdateItemRequest) =>
    api.put<Cart>(`/cart/items/${id}`, body).then((r) => r.data),

  removeItem: (id: string) => api.delete<Cart>(`/cart/items/${id}`).then((r) => r.data),

  clear: () => api.delete<void>("/cart").then((r) => r.data),
};
