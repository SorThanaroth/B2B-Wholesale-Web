import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAdminOrder, useUpdateOrderStatus } from "@/hooks/useOrders";
import { PageHeader } from "@/components/common/PageHeader";
import { OrderItemsTable, OrderSplitsTable } from "@/components/common/OrderTables";
import {
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  LoadingState,
  PaymentStatusBadge,
  Select,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUSES } from "@/constants";
import { ROUTES } from "@/constants/routes";
import type { OrderStatus } from "@/types/api";

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, error, refetch } = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) return <LoadingState />;
  if (isError || !order) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <>
      <Link
        to={ROUTES.adminOrders}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <PageHeader
        title={`Order #${order.id.slice(0, 8)}`}
        subtitle={`Placed ${formatDateTime(order.createdAt)} · merchant ${order.userId.slice(0, 8)}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Items" />
            <OrderItemsTable items={order.items} />
          </Card>
          <Card>
            <CardHeader title="Settlement breakdown" description="Each supplier’s share" />
            <OrderSplitsTable splits={order.splits} />
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardBody className="space-y-4">
              <h3 className="font-semibold text-slate-800">Manage order</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Payment</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <Select
                label="Fulfilment status"
                value={order.status}
                options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
                disabled={updateStatus.isPending}
                onChange={(e) =>
                  updateStatus.mutate({ id: order.id, status: e.target.value as OrderStatus })
                }
              />
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
