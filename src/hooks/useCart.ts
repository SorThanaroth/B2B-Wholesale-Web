import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryClient";
import { getApiErrorMessage } from "@/lib/apiClient";
import { cartService } from "@/services/cart.service";
import type { Cart } from "@/types/api";
import { useAuth } from "./useAuth";

/**
 * The merchant's active cart. Server-owned state (the backend builds the
 * per-company grouping), so we treat React Query as the cart's source of truth
 * and write mutation results straight back into the cache.
 */
export function useCart() {
  const { isMerchant } = useAuth();
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: cartService.get,
    enabled: isMerchant, // only merchants have a cart
  });
}

/** Lightweight item count for the navbar badge. */
export function useCartCount(): number {
  const { data } = useCart();
  return data?.totalItems ?? 0;
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cartService.addItem,
    onSuccess: (cart) => {
      qc.setQueryData(queryKeys.cart, cart);
      toast.success("Added to cart");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      cartService.updateItem(id, { quantity }),
    onSuccess: (cart: Cart) => qc.setQueryData(queryKeys.cart, cart),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cartService.removeItem(id),
    onSuccess: (cart: Cart) => {
      qc.setQueryData(queryKeys.cart, cart);
      toast.success("Item removed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cartService.clear,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart });
      toast.success("Cart cleared");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
