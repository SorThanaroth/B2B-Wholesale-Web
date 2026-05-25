import type { ReactNode } from "react";
import {
  DataTable,
  FulfillmentStatusBadge,
  SplitStatusBadge,
  type Column,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { OrderItem, OrderSplit } from "@/types/api";

const itemColumns: Column<OrderItem>[] = [
  {
    key: "product",
    header: "Product",
    render: (i) => (
      <div>
        <p className="font-medium text-slate-800">{i.productName}</p>
        <p className="text-xs text-slate-400">{i.companyName}</p>
      </div>
    ),
  },
  { key: "qty", header: "Qty", align: "center", render: (i) => i.quantity },
  { key: "price", header: "Unit price", align: "right", render: (i) => formatCurrency(i.unitPrice) },
  {
    key: "subtotal",
    header: "Subtotal",
    align: "right",
    render: (i) => <span className="font-semibold">{formatCurrency(i.subtotal)}</span>,
  },
];

export function OrderItemsTable({ items }: { items: OrderItem[] }) {
  return <DataTable columns={itemColumns} rows={items} rowKey={(i) => i.id} />;
}

/**
 * Per-company settlement + delivery breakdown (Section 8.2). `actions` renders a
 * trailing cell per row — used by the merchant (confirm arrival) and admin (override).
 */
export function OrderSplitsTable({
  splits,
  actions,
}: {
  splits: OrderSplit[];
  actions?: (split: OrderSplit) => ReactNode;
}) {
  const columns: Column<OrderSplit>[] = [
    {
      key: "company",
      header: "Supplier",
      render: (s) => <span className="font-medium text-slate-800">{s.companyName}</span>,
    },
    { key: "subtotal", header: "Owed", align: "right", render: (s) => formatCurrency(s.subtotal) },
    {
      key: "delivery",
      header: "Delivery",
      render: (s) => <FulfillmentStatusBadge status={s.fulfillmentStatus} />,
    },
    { key: "settlement", header: "Settlement", render: (s) => <SplitStatusBadge status={s.paymentStatus} /> },
    { key: "paid", header: "Paid at", render: (s) => formatDateTime(s.paidAt) },
  ];

  if (actions) {
    columns.push({ key: "actions", header: "", align: "right", render: actions });
  }

  return <DataTable columns={columns} rows={splits} rowKey={(s) => s.id} />;
}
