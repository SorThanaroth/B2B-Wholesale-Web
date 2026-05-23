import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Clock, Receipt, ShieldCheck, Smartphone } from "lucide-react";
import { useOrderQr, usePaymentStatus, useSimulatePayment } from "@/hooks/usePayment";
import { PageHeader } from "@/components/common/PageHeader";
import { Button, Card, CardBody, ErrorState, LoadingState, Spinner } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: qr, isLoading, isError, error, refetch } = useOrderQr(orderId);
  const { data: status } = usePaymentStatus(orderId);
  const simulate = useSimulatePayment();

  if (isLoading) return <LoadingState label="Generating your payment QR…" />;
  if (isError || !qr) return <ErrorState error={error} onRetry={refetch} />;

  const paid = status?.paymentStatus === "PAID" || qr.status === "PAID";

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Pay with unified QR"
        subtitle={`Order #${qr.orderId.slice(0, 8)} · pays every supplier in one scan`}
      />

      <Card>
        <CardBody>
          {paid ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Payment received</h2>
                <p className="mt-1 text-slate-500">
                  {formatCurrency(qr.amount)} paid. Each supplier’s share is now queued for
                  settlement.
                </p>
              </div>
              <div className="flex gap-3">
                <Link to={ROUTES.order(qr.orderId)}>
                  <Button>
                    <Receipt className="h-4 w-4" />
                    View order
                  </Button>
                </Link>
                <Link to={ROUTES.orders}>
                  <Button variant="outline">All orders</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-4 text-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {qr.qrImageDataUri ? (
                  <img src={qr.qrImageDataUri} alt="Payment QR code" className="h-56 w-56" />
                ) : (
                  <div className="flex h-56 w-56 items-center justify-center text-slate-300">
                    <Smartphone className="h-16 w-16" />
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">Amount due</p>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(qr.amount)}</p>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700">
                <Spinner className="h-4 w-4" />
                Waiting for payment…
              </div>

              <ol className="w-full max-w-sm space-y-2 text-left text-sm text-slate-500">
                <li className="flex gap-2">
                  <Smartphone className="h-4 w-4 shrink-0 text-accent-500" /> Open your KHQR / Bakong
                  banking app and scan the code.
                </li>
                <li className="flex gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-accent-500" /> Confirm the amount —
                  this single payment covers every supplier.
                </li>
                <li className="flex gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-accent-500" /> This page updates
                  automatically once the bank confirms.
                </li>
              </ol>

              {/* Demo-only: simulate the gateway webhook so the flow can be shown end-to-end. */}
              <div className="w-full border-t border-dashed border-slate-200 pt-4">
                <p className="mb-2 text-xs text-slate-400">
                  Demo environment — no real bank app connected
                </p>
                <Button
                  variant="secondary"
                  loading={simulate.isPending}
                  onClick={() => simulate.mutate({ reference: qr.qrToken, status: "PAID" })}
                >
                  Simulate successful payment
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
