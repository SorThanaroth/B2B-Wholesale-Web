import {
  COMPANY_STATUS_META,
  FULFILLMENT_STATUS_META,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  SPLIT_STATUS_META,
  USER_STATUS_META,
} from "@/constants";
import type {
  CompanyStatus,
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
  SplitStatus,
  UserStatus,
} from "@/types/api";
import { Badge } from "./Badge";

/** Renders the right colour + label for any backend status enum. */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const m = ORDER_STATUS_META[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const m = PAYMENT_STATUS_META[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function SplitStatusBadge({ status }: { status: SplitStatus }) {
  const m = SPLIT_STATUS_META[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const m = USER_STATUS_META[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  const m = COMPANY_STATUS_META[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function FulfillmentStatusBadge({ status }: { status: FulfillmentStatus }) {
  const m = FULFILLMENT_STATUS_META[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
