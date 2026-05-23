import { Link } from "react-router-dom";
import {
  Building2,
  CircleDollarSign,
  ClipboardList,
  PackageCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Button, Card, CardBody, CardHeader, ErrorState, LoadingState } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();

  return (
    <>
      <PageHeader
        title="Platform overview"
        subtitle="Revenue, orders and settlement health across the marketplace."
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total revenue"
              value={formatCurrency(data.totalRevenue)}
              icon={CircleDollarSign}
              tone="success"
              hint="From paid orders"
            />
            <StatCard label="Total orders" value={data.totalOrders} icon={ClipboardList} tone="info" />
            <StatCard
              label="Paid orders"
              value={data.paidOrders}
              icon={PackageCheck}
              tone="info"
            />
            <StatCard label="Active merchants" value={data.activeMerchants} icon={Users} tone="neutral" />
            <StatCard
              label="Active companies"
              value={data.activeCompanies}
              icon={Building2}
              tone="neutral"
            />
            <StatCard
              label="Pending settlements"
              value={data.pendingSettlements}
              icon={Wallet}
              tone="warning"
              hint="Awaiting payout to suppliers"
            />
          </div>

          <Card>
            <CardHeader title="Quick actions" />
            <CardBody className="flex flex-wrap gap-3">
              <Link to={ROUTES.adminSettlements}>
                <Button variant="secondary">
                  <Wallet className="h-4 w-4" />
                  Process settlements
                </Button>
              </Link>
              <Link to={ROUTES.adminOrders}>
                <Button variant="outline">
                  <ClipboardList className="h-4 w-4" />
                  Manage orders
                </Button>
              </Link>
              <Link to={ROUTES.adminProducts}>
                <Button variant="outline">
                  <PackageCheck className="h-4 w-4" />
                  Manage products
                </Button>
              </Link>
              <Link to={ROUTES.adminReports}>
                <Button variant="outline">
                  <CircleDollarSign className="h-4 w-4" />
                  View reports
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      ) : null}
    </>
  );
}
