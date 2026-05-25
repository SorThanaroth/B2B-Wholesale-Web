import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryClient";
import { getApiErrorMessage } from "@/lib/apiClient";
import { adminOrderService, orderService } from "@/services/order.service";
import type { AdminOrderQuery, FulfillmentStatus, OrderStatus } from "@/types/api";

/* ------------------------------ Merchant orders ----------------------------- */
export function useMyOrders(params: { page?: number; size?: number; sort?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.orders(params),
    queryFn: () => orderService.myOrders(params),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.order(id ?? ""),
    queryFn: () => orderService.get(id as string),
    enabled: !!id,
  });
}

/** Merchant confirms a supplier's share of the order has arrived. */
export function useConfirmDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, splitId }: { orderId: string; splitId: string }) =>
      orderService.confirmDelivery(orderId, splitId),
    onSuccess: (detail) => {
      qc.setQueryData(queryKeys.order(detail.id), detail);
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Marked as arrived");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderService.checkout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

/** Triggers the browser download of an order's PDF invoice. */
export function useDownloadInvoice() {
  return useMutation({
    mutationFn: (id: string) => orderService.invoice(id),
    onSuccess: (blob, id) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

/* -------------------------------- Admin orders ------------------------------ */
export function useAdminOrders(query: AdminOrderQuery) {
  return useQuery({
    queryKey: queryKeys.adminOrders(query),
    queryFn: () => adminOrderService.list(query),
  });
}

export function useAdminOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.adminOrder(id ?? ""),
    queryFn: () => adminOrderService.get(id as string),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      adminOrderService.updateStatus(id, { status }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: queryKeys.adminOrder(id) });
      toast.success("Order status updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

/** Admin override of one company-split's delivery status. */
export function useAdminSetSplitFulfillment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      splitId,
      status,
    }: {
      orderId: string;
      splitId: string;
      status: FulfillmentStatus;
    }) => adminOrderService.setSplitFulfillment(orderId, splitId, status),
    onSuccess: (detail) => {
      qc.setQueryData(queryKeys.adminOrder(detail.id), detail);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Delivery status updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
