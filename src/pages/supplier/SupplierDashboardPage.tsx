import { Link, useNavigate } from "react-router-dom";
import { Boxes, ClipboardList, Package, Wallet } from "lucide-react";
import { useSupplierDashboard } from "@/hooks/useSupplier";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import {
  Card,
  CardHeader,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  OrderStatusBadge,
  SplitStatusBadge,
  type Column,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { SupplierOrderRow } from "@/types/api";

export function SupplierDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useSupplierDashboard();

  const recentColumns: Column<SupplierOrderRow>[] = [
    {
      key: "id",
      header: "Order",
      render: (o) => <span className="font-mono text-xs">#{o.orderId.slice(0, 8)}</span>,
    },
    { key: "date", header: "Date", render: (o) => formatDate(o.createdAt) },
    {
      key: "amount",
      header: "Your share",
      align: "right",
      render: (o) => formatCurrency(o.companySubtotal),
    },
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
        title={`Hello, ${user?.fullName.split(" ")[0] ?? "Supplier"}`}
        subtitle="Your company's catalog, orders and settlement at a glance."
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active products"
              value={`${data.activeProducts}/${data.totalProducts}`}
              icon={Package}
              tone="info"
              hint="Active / total in catalog"
            />
            <StatCard label="Orders" value={data.ordersInvolved} icon={ClipboardList} tone="neutral" />
            <StatCard
              label="Awaiting payout"
              value={formatCurrency(data.pendingSettlementAmount)}
              icon={Wallet}
              tone="warning"
            />
            <StatCard
              label="Settled to date"
              value={formatCurrency(data.settledAmount)}
              icon={Boxes}
              tone="success"
            />
          </div>

          <Card>
            <CardHeader
              title="Recent orders"
              action={
                <Link
                  to={ROUTES.supplierOrders}
                  className="text-sm font-medium text-accent-600 hover:text-accent-700"
                >
                  View all
                </Link>
              }
            />
            {data.recentOrders.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No orders yet"
                description="Orders that include your products will appear here."
              />
            ) : (
              <DataTable
                columns={recentColumns}
                rows={data.recentOrders}
                rowKey={(o) => o.orderId}
                onRowClick={(o) => navigate(ROUTES.supplierOrder(o.orderId))}
              />
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
