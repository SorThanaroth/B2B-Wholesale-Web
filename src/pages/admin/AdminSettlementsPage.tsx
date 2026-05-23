import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Download } from "lucide-react";
import {
  useDownloadSettlementReport,
  useSettlements,
  useSettleSplit,
} from "@/hooks/useAdmin";
import { useCompanies } from "@/hooks/useCatalog";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Button,
  Card,
  CardBody,
  ConfirmDialog,
  DataTable,
  ErrorState,
  LoadingState,
  Pagination,
  Select,
  SplitStatusBadge,
  type Column,
  type SelectOption,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { SPLIT_STATUSES } from "@/constants";
import { ROUTES } from "@/constants/routes";
import type { Settlement, SplitStatus } from "@/types/api";

export function AdminSettlementsPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [company, setCompany] = useState("");
  const [toSettle, setToSettle] = useState<Settlement | null>(null);

  const { data: companies } = useCompanies({ size: 100 });
  const companyOptions: SelectOption[] =
    companies?.content.map((c) => ({ value: c.id, label: c.name })) ?? [];

  const filters = useMemo(
    () => ({
      company: company || undefined,
      status: (status || undefined) as SplitStatus | undefined,
    }),
    [company, status],
  );

  const query = useMemo(() => ({ ...filters, page, size: 15 }), [filters, page]);

  const { data, isLoading, isError, error, refetch } = useSettlements(query);
  const settleSplit = useSettleSplit();
  const downloadReport = useDownloadSettlementReport();

  const columns: Column<Settlement>[] = [
    {
      key: "order",
      header: "Order",
      render: (s) => (
        <Link
          to={ROUTES.adminOrder(s.orderId)}
          className="font-mono text-xs text-accent-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          #{s.orderId.slice(0, 8)}
        </Link>
      ),
    },
    { key: "company", header: "Supplier", render: (s) => <span className="font-medium text-slate-800">{s.companyName}</span> },
    { key: "bank", header: "Bank account", render: (s) => <span className="font-mono text-xs">{s.bankAccount}</span> },
    {
      key: "amount",
      header: "Payout",
      align: "right",
      render: (s) => <span className="font-semibold">{formatCurrency(s.subtotal)}</span>,
    },
    { key: "status", header: "Status", render: (s) => <SplitStatusBadge status={s.status} /> },
    { key: "paid", header: "Paid at", render: (s) => formatDateTime(s.paidAt) },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (s) =>
        s.status === "PENDING_SETTLEMENT" ? (
          <Button size="sm" variant="secondary" onClick={() => setToSettle(s)}>
            <CheckCircle2 className="h-4 w-4" />
            Settle
          </Button>
        ) : s.status === "SETTLED" ? (
          <span className="text-xs text-emerald-600">Settled {formatDateTime(s.settledAt)}</span>
        ) : (
          <span className="text-xs text-slate-400">Awaiting payment</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Settlements"
        subtitle="Per-company payout obligations from paid orders (Section 8.2)."
        actions={
          <Button
            variant="outline"
            loading={downloadReport.isPending}
            onClick={() => downloadReport.mutate(filters)}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <Card className="mb-4">
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <Select
            label="Company"
            placeholder="All companies"
            options={companyOptions}
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
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
            empty="No settlement records match these filters."
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

      <ConfirmDialog
        open={!!toSettle}
        onClose={() => setToSettle(null)}
        onConfirm={() =>
          toSettle &&
          settleSplit.mutate(toSettle.splitId, { onSuccess: () => setToSettle(null) })
        }
        destructive={false}
        title="Mark as settled?"
        message={
          toSettle
            ? `Confirm that ${formatCurrency(toSettle.subtotal)} has been paid out to ${toSettle.companyName} (${toSettle.bankAccount}).`
            : ""
        }
        confirmLabel="Mark settled"
        loading={settleSplit.isPending}
      />
    </>
  );
}
