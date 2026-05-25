import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminOrders } from "@/hooks/useOrders";
import { useCompanies } from "@/hooks/useCatalog";
import { usePagination } from "@/hooks/usePagination";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Card,
  CardBody,
  DataTable,
  ErrorState,
  Input,
  LoadingState,
  OrderStatusBadge,
  Pagination,
  PaymentStatusBadge,
  Select,
  type Column,
  type SelectOption,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUSES } from "@/constants";
import { ROUTES } from "@/constants/routes";
import type { OrderStatus, OrderSummary } from "@/types/api";

/** `<input type=date>` value → ISO instant at start/end of that day. */
const toIso = (date: string, end = false) =>
  date ? new Date(`${date}T${end ? "23:59:59" : "00:00:00"}`).toISOString() : undefined;

export function AdminOrdersPage() {
  const navigate = useNavigate();
  const { page, size, setPage, setSize } = usePagination();
  const [status, setStatus] = useState("");
  const [company, setCompany] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: companies } = useCompanies({ size: 100 });
  const companyOptions: SelectOption[] =
    companies?.content.map((c) => ({ value: c.id, label: c.name })) ?? [];

  const query = useMemo(
    () => ({
      page,
      size,
      status: (status || undefined) as OrderStatus | undefined,
      company: company || undefined,
      from: toIso(from),
      to: toIso(to, true),
    }),
    [page, size, status, company, from, to],
  );

  const { data, isLoading, isError, error, refetch } = useAdminOrders(query);

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
    { key: "go", header: "", align: "right", render: () => <span className="text-sm text-accent-600">Manage →</span> },
  ];

  return (
    <>
      <PageHeader title="Orders" subtitle="Every order across the platform." />

      <Card className="mb-4">
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Status"
            placeholder="All statuses"
            options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
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
          <Input
            label="From"
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(0);
            }}
          />
          <Input
            label="To"
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
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
            rowKey={(o) => o.id}
            onRowClick={(o) => navigate(ROUTES.adminOrder(o.id))}
            empty="No orders match these filters."
          />
          <div className="px-4">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onChange={setPage}
              pageSize={size}
              onPageSizeChange={setSize}
            />
          </div>
        </Card>
      ) : null}
    </>
  );
}
