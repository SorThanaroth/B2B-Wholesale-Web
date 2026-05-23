import { Link } from "react-router-dom";
import { Clock, Receipt, ShoppingBag, Store, Wallet } from "lucide-react";
import { useMerchantDashboard } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  OrderStatusBadge,
  PaymentStatusBadge,
  type Column,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { OrderSummary } from "@/types/api";

const recentColumns: Column<OrderSummary>[] = [
  { key: "id", header: "Order", render: (o) => <span className="font-mono text-xs">#{o.id.slice(0, 8)}</span> },
  { key: "date", header: "Date", render: (o) => formatDate(o.createdAt) },
  { key: "total", header: "Total", align: "right", render: (o) => formatCurrency(o.totalAmount) },
  { key: "payment", header: "Payment", render: (o) => <PaymentStatusBadge status={o.paymentStatus} /> },
  { key: "status", header: "Status", render: (o) => <OrderStatusBadge status={o.status} /> },
];

export function MerchantDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useMerchantDashboard();

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.fullName.split(" ")[0] ?? "Merchant"}`}
        subtitle="Here’s a snapshot of your wholesale activity."
        actions={
          <Link to={ROUTES.catalog}>
            <Button>
              <Store className="h-4 w-4" />
              Browse catalog
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total orders" value={data.totalOrders} icon={Receipt} tone="info" />
            <StatCard
              label="Pending payments"
              value={data.pendingPayments}
              icon={Clock}
              tone="warning"
            />
            <StatCard
              label="Total spent"
              value={formatCurrency(data.totalSpent)}
              icon={Wallet}
              tone="success"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Recent orders"
                action={
                  <Link to={ROUTES.orders} className="text-sm font-medium text-accent-600 hover:text-accent-700">
                    View all
                  </Link>
                }
              />
              {data.recentOrders.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="No orders yet"
                  description="Your most recent orders will appear here once you check out."
                  action={
                    <Link to={ROUTES.catalog}>
                      <Button size="sm">Start ordering</Button>
                    </Link>
                  }
                />
              ) : (
                <DataTable
                  columns={recentColumns}
                  rows={data.recentOrders}
                  rowKey={(o) => o.id}
                />
              )}
            </Card>

            <Card>
              <CardHeader title="Spending by company" />
              <CardBody className="space-y-4">
                {data.spendingByCompany.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">No spending recorded yet.</p>
                ) : (
                  data.spendingByCompany.map((c) => {
                    const max = Math.max(...data.spendingByCompany.map((x) => x.amount), 1);
                    return (
                      <div key={c.companyId}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="truncate font-medium text-slate-700">{c.companyName}</span>
                          <span className="text-slate-500">{formatCurrency(c.amount)}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-accent-500"
                            style={{ width: `${(c.amount / max) * 100}%` }}
                          />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">{c.orderCount} order(s)</p>
                      </div>
                    );
                  })
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
