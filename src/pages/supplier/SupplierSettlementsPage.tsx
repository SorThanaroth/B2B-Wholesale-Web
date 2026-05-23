import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSupplierSettlements } from "@/hooks/useSupplier";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Card,
  CardBody,
  DataTable,
  ErrorState,
  LoadingState,
  Pagination,
  Select,
  SplitStatusBadge,
  type Column,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { SPLIT_STATUSES } from "@/constants";
import { ROUTES } from "@/constants/routes";
import type { Settlement, SplitStatus } from "@/types/api";

export function SupplierSettlementsPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");

  const params = useMemo(
    () => ({ page, size: 15, status: (status || undefined) as SplitStatus | undefined }),
    [page, status],
  );
  const { data, isLoading, isError, error, refetch } = useSupplierSettlements(params);

  const columns: Column<Settlement>[] = [
    {
      key: "order",
      header: "Order",
      render: (s) => (
        <Link
          to={ROUTES.supplierOrder(s.orderId)}
          className="font-mono text-xs text-accent-600 hover:underline"
        >
          #{s.orderId.slice(0, 8)}
        </Link>
      ),
    },
    {
      key: "amount",
      header: "Payout",
      align: "right",
      render: (s) => <span className="font-semibold">{formatCurrency(s.subtotal)}</span>,
    },
    { key: "status", header: "Status", render: (s) => <SplitStatusBadge status={s.status} /> },
    { key: "paid", header: "Paid at", render: (s) => formatDateTime(s.paidAt) },
    { key: "settled", header: "Settled at", render: (s) => formatDateTime(s.settledAt) },
  ];

  return (
    <>
      <PageHeader
        title="Settlements"
        subtitle="Track payouts owed to your company from paid orders."
      />

      <Card className="mb-4">
        <CardBody className="max-w-xs">
          <Select
            label="Status"
            placeholder="All statuses"
            options={SPLIT_STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") }))}
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
            rowKey={(s) => s.splitId}
            empty="No settlement records yet."
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
