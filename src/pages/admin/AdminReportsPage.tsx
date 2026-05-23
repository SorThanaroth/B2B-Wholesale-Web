import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useMerchantActivityReport,
  useRevenueReport,
  useTopProductsReport,
} from "@/hooks/useAdmin";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Card,
  CardBody,
  CardHeader,
  DataTable,
  Input,
  LoadingState,
  type Column,
} from "@/components/ui";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { MerchantActivityRow, TopProductRow } from "@/types/api";

const BAR_COLORS = ["#1f8ba6", "#345d94", "#5dc1d6", "#274876", "#33a8c2", "#7e9ec9"];

const toIso = (date: string, end = false) =>
  date ? new Date(`${date}T${end ? "23:59:59" : "00:00:00"}`).toISOString() : undefined;

export function AdminReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const revenueParams = useMemo(
    () => ({ from: toIso(from), to: toIso(to, true) }),
    [from, to],
  );

  const { data: revenue, isLoading: revLoading } = useRevenueReport(revenueParams);
  const { data: topProducts, isLoading: prodLoading } = useTopProductsReport(10);
  const { data: merchants, isLoading: merchLoading } = useMerchantActivityReport(10);

  const chartData =
    revenue?.map((r) => ({ name: r.companyName, revenue: Number(r.revenue) })) ?? [];

  const productColumns: Column<TopProductRow>[] = [
    { key: "name", header: "Product", render: (p) => <span className="font-medium text-slate-800">{p.productName}</span> },
    { key: "qty", header: "Units sold", align: "right", render: (p) => formatNumber(p.quantitySold) },
    { key: "rev", header: "Revenue", align: "right", render: (p) => <span className="font-semibold">{formatCurrency(p.revenue)}</span> },
  ];

  const merchantColumns: Column<MerchantActivityRow>[] = [
    { key: "name", header: "Merchant", render: (m) => <span className="font-medium text-slate-800">{m.fullName}</span> },
    { key: "orders", header: "Orders", align: "right", render: (m) => formatNumber(m.orderCount) },
    { key: "spent", header: "Total spent", align: "right", render: (m) => <span className="font-semibold">{formatCurrency(m.totalSpent)}</span> },
  ];

  return (
    <>
      <PageHeader title="Reports & analytics" subtitle="Revenue, top products and merchant activity." />

      {/* Revenue by company */}
      <Card className="mb-6">
        <CardHeader
          title="Revenue by company"
          action={
            <div className="flex items-end gap-2">
              <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          }
        />
        <CardBody>
          {revLoading ? (
            <LoadingState />
          ) : chartData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} interval={0} angle={-12} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-slate-400">No revenue in this period yet.</p>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top products" description="Best sellers by units sold" />
          {prodLoading ? (
            <LoadingState />
          ) : (
            <DataTable
              columns={productColumns}
              rows={topProducts ?? []}
              rowKey={(p) => p.productId}
              empty="No sales recorded yet."
            />
          )}
        </Card>

        <Card>
          <CardHeader title="Merchant activity" description="Most active buyers by spend" />
          {merchLoading ? (
            <LoadingState />
          ) : (
            <DataTable
              columns={merchantColumns}
              rows={merchants ?? []}
              rowKey={(m) => m.userId}
              empty="No merchant activity yet."
            />
          )}
        </Card>
      </div>
    </>
  );
}
