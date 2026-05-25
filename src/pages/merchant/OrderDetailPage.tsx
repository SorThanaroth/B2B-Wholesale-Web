import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Download, QrCode } from "lucide-react";
import { useConfirmDelivery, useDownloadInvoice, useOrder } from "@/hooks/useOrders";
import { PageHeader } from "@/components/common/PageHeader";
import { OrderItemsTable, OrderSplitsTable } from "@/components/common/OrderTables";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  LoadingState,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const downloadInvoice = useDownloadInvoice();
  const confirmDelivery = useConfirmDelivery();

  if (isLoading) return <LoadingState />;
  if (isError || !order) return <ErrorState error={error} onRetry={refetch} />;

  const isPaid = order.paymentStatus === "PAID";

  return (
    <>
      <Link
        to={ROUTES.orders}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <PageHeader
        title={`Order #${order.id.slice(0, 8)}`}
        subtitle={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <div className="flex gap-2">
            {order.paymentStatus === "PENDING" && (
              <Button variant="secondary" onClick={() => navigate(ROUTES.payment(order.id))}>
                <QrCode className="h-4 w-4" />
                Pay now
              </Button>
            )}
            {isPaid && (
              <Button
                variant="outline"
                loading={downloadInvoice.isPending}
                onClick={() => downloadInvoice.mutate(order.id)}
              >
                <Download className="h-4 w-4" />
                Invoice (PDF)
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Items" description={`${order.items.length} line item(s)`} />
            <OrderItemsTable items={order.items} />
          </Card>

          <Card>
            <CardHeader
              title="Suppliers & delivery"
              description="Confirm arrival once each supplier's items reach you"
            />
            <OrderSplitsTable
              splits={order.splits}
              actions={(s) =>
                isPaid && s.fulfillmentStatus !== "DELIVERED" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={confirmDelivery.isPending && confirmDelivery.variables?.splitId === s.id}
                    onClick={() => confirmDelivery.mutate({ orderId: order.id, splitId: s.id })}
                  >
                    <Check className="h-4 w-4" />
                    Confirm arrival
                  </Button>
                ) : null
              }
            />
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardBody className="space-y-4">
              <h3 className="font-semibold text-slate-800">Summary</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Order status</dt>
                  <dd><OrderStatusBadge status={order.status} /></dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Payment</dt>
                  <dd><PaymentStatusBadge status={order.paymentStatus} /></dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Suppliers</dt>
                  <dd className="font-medium text-slate-700">{order.splits.length}</dd>
                </div>
              </dl>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="font-medium text-slate-700">Total</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
