import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSupplierOrder } from "@/hooks/useSupplier";
import { PageHeader } from "@/components/common/PageHeader";
import { OrderItemsTable } from "@/components/common/OrderTables";
import {
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  LoadingState,
  OrderStatusBadge,
  PaymentStatusBadge,
  SplitStatusBadge,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export function SupplierOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, error, refetch } = useSupplierOrder(id);

  if (isLoading) return <LoadingState />;
  if (isError || !order) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <>
      <Link
        to={ROUTES.supplierOrders}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <PageHeader
        title={`Order #${order.orderId.slice(0, 8)}`}
        subtitle={`Placed ${formatDateTime(order.createdAt)}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Your line items"
              description="Only products supplied by your company are shown."
            />
            <OrderItemsTable items={order.items} />
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardBody className="space-y-4">
              <h3 className="font-semibold text-slate-800">Your share</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Order status</dt>
                  <dd><OrderStatusBadge status={order.orderStatus} /></dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Payment</dt>
                  <dd><PaymentStatusBadge status={order.paymentStatus} /></dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Settlement</dt>
                  <dd>
                    {order.settlementStatus ? (
                      <SplitStatusBadge status={order.settlementStatus} />
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                {order.paidAt && (
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Paid at</dt>
                    <dd className="text-slate-700">{formatDateTime(order.paidAt)}</dd>
                  </div>
                )}
                {order.settledAt && (
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Settled at</dt>
                    <dd className="text-slate-700">{formatDateTime(order.settledAt)}</dd>
                  </div>
                )}
              </dl>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="font-medium text-slate-700">Your payout</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrency(order.companySubtotal)}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
