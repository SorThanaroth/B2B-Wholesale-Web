import { api } from "@/lib/apiClient";
import type { CallbackRequest, PaymentStatusResponse, QrResponse } from "@/types/api";

/** Section 9.8 — Payments (unified QR + status polling). */
export const paymentService = {
  getQr: (orderId: string) =>
    api.get<QrResponse>(`/payments/${orderId}/qr`).then((r) => r.data),

  getStatus: (orderId: string) =>
    api.get<PaymentStatusResponse>(`/payments/${orderId}/status`).then((r) => r.data),

  /**
   * Public webhook the gateway calls on payment. In the MVP this doubles as a
   * "simulate payment" hook — handy for demoing the QR flow without a real bank app.
   */
  simulateCallback: (body: CallbackRequest) =>
    api.post<{ message: string }>("/payments/callback", body).then((r) => r.data),
};
