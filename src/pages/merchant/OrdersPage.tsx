import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QrCode, Store } from "lucide-react";
import { useMyOrders } from "@/hooks/useOrders";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  OrderStatusBadge,
  Pagination,
  PaymentStatusBadge,
  type Column,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { ROUTES } from "@/constants/routes";
import type { OrderSummary } from "@/types/api";

export function OrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, error, refetch } = useMyOrders({
    page,
    size: DEFAULT_PAGE_SIZE,
  });

  const columns: Column<OrderSummary>[] = [
    {
      key: "id",
      header: "Order",
      render: (o) => <span className="font-mono text-xs text-slate-600">#{o.id.slice(0, 8)}</span>,
    },
    { key: "date", header: "Placed", render: (o) => formatDateTime(o.createdAt) },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (o) => <span className="font-semibold">{formatCurrency(o.totalAmount)}</span>,
    },
    { key: "payment", header: "Payment", render: (o) => <PaymentStatusBadge status={o.paymentStatus} /> },
    { key: "status", header: "Status", render: (o) => <OrderStatusBadge status={o.status} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (o) =>
        o.paymentStatus === "PENDING" ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.payment(o.id));
            }}
          >
            <QrCode className="h-4 w-4" />
            Pay
          </Button>
        ) : (
          <span className="text-sm text-accent-600">View →</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader title="Order history" subtitle="Track every order and download invoices." />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data && data.content.length > 0 ? (
        <Card>
          <DataTable
            columns={columns}
            rows={data.content}
            rowKey={(o) => o.id}
            onRowClick={(o) => navigate(ROUTES.order(o.id))}
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
      ) : (
        <EmptyState
          icon={Store}
          title="No orders yet"
          description="Once you check out, your orders will show up here."
          action={
            <Link to={ROUTES.catalog}>
              <Button>Browse catalog</Button>
            </Link>
          }
        />
      )}
    </>
  );
}
