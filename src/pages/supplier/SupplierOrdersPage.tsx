import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupplierOrders } from "@/hooks/useSupplier";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Card,
  CardBody,
  DataTable,
  ErrorState,
  LoadingState,
  OrderStatusBadge,
  Pagination,
  PaymentStatusBadge,
  Select,
  SplitStatusBadge,
  type Column,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUSES } from "@/constants";
import { ROUTES } from "@/constants/routes";
import type { OrderStatus, SupplierOrderRow } from "@/types/api";

export function SupplierOrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");

  const params = useMemo(
    () => ({ page, size: 15, status: (status || undefined) as OrderStatus | undefined }),
    [page, status],
  );
  const { data, isLoading, isError, error, refetch } = useSupplierOrders(params);

  const columns: Column<SupplierOrderRow>[] = [
    {
      key: "id",
      header: "Order",
      render: (o) => <span className="font-mono text-xs text-slate-600">#{o.orderId.slice(0, 8)}</span>,
    },
    { key: "date", header: "Placed", render: (o) => formatDateTime(o.createdAt) },
    {
      key: "amount",
      header: "Your share",
      align: "right",
      render: (o) => <span className="font-semibold">{formatCurrency(o.companySubtotal)}</span>,
    },
    { key: "payment", header: "Payment", render: (o) => <PaymentStatusBadge status={o.paymentStatus} /> },
    { key: "status", header: "Order", render: (o) => <OrderStatusBadge status={o.orderStatus} /> },
    {
      key: "settle",
      header: "Settlement",
      render: (o) => (o.settlementStatus ? <SplitStatusBadge status={o.settlementStatus} /> : "—"),
    },
  ];

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Every order that includes one of your products — showing your share."
      />

      <Card className="mb-4">
        <CardBody className="max-w-xs">
          <Select
            label="Order status"
            placeholder="All statuses"
            options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          />
        </CardBody>
      </Card>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data ? (
        <Card>
          <DataTable
            columns={columns}
            rows={data.content}
            rowKey={(o) => o.orderId}
            onRowClick={(o) => navigate(ROUTES.supplierOrder(o.orderId))}
            empty="No orders include your products yet."
          />
          <div className="px-4">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onChange={setPage}
            />
          </div>
        </Card>
      ) : null}
    </>
  );
}
