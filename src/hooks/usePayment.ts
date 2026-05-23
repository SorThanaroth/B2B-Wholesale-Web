import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryClient";
import { getApiErrorMessage } from "@/lib/apiClient";
import { paymentService } from "@/services/payment.service";
import type { CallbackRequest } from "@/types/api";

export function useOrderQr(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.qr(orderId ?? ""),
    queryFn: () => paymentService.getQr(orderId as string),
    enabled: !!orderId,
  });
}

/**
 * Polls payment status while the order is still PENDING. The SPA shows a live
 * "waiting for payment" state until the gateway webhook flips it to PAID (§7.1).
 */
export function usePaymentStatus(orderId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.paymentStatus(orderId ?? ""),
    queryFn: () => paymentService.getStatus(orderId as string),
    enabled: !!orderId && enabled,
    refetchInterval: (query) =>
      query.state.data?.paymentStatus === "PENDING" ? 3000 : false,
  });
}

/** Demo helper: simulate the bank webhook so the QR flow can be shown end-to-end. */
export function useSimulatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CallbackRequest) => paymentService.simulateCallback(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-status"] });
      toast.success("Payment simulated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
