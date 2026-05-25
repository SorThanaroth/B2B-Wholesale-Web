/**
 * UI metadata for the backend enums — labels + badge colour tokens — kept in one
 * place so status rendering is consistent across merchant and admin screens.
 */
import type {
  CompanyStatus,
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
  SplitStatus,
  UserStatus,
} from "@/types/api";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

interface StatusMeta {
  label: string;
  tone: BadgeTone;
}

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  PENDING: { label: "Pending", tone: "warning" },
  PAID: { label: "Paid", tone: "info" },
  SHIPPED: { label: "Shipped", tone: "info" },
  DELIVERED: { label: "Delivered", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  PENDING: { label: "Pending", tone: "warning" },
  PAID: { label: "Paid", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  EXPIRED: { label: "Expired", tone: "neutral" },
};

export const SPLIT_STATUS_META: Record<SplitStatus, StatusMeta> = {
  PENDING: { label: "Pending", tone: "neutral" },
  PENDING_SETTLEMENT: { label: "Awaiting payout", tone: "warning" },
  SETTLED: { label: "Settled", tone: "success" },
};

export const FULFILLMENT_STATUS_META: Record<FulfillmentStatus, StatusMeta> = {
  PROCESSING: { label: "Processing", tone: "neutral" },
  SHIPPED: { label: "Shipped", tone: "info" },
  DELIVERED: { label: "Arrived", tone: "success" },
};

export const USER_STATUS_META: Record<UserStatus, StatusMeta> = {
  PENDING: { label: "Pending", tone: "warning" },
  ACTIVE: { label: "Active", tone: "success" },
  SUSPENDED: { label: "Suspended", tone: "danger" },
};

export const COMPANY_STATUS_META: Record<CompanyStatus, StatusMeta> = {
  ACTIVE: { label: "Active", tone: "success" },
  INACTIVE: { label: "Inactive", tone: "neutral" },
};

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const SPLIT_STATUSES: SplitStatus[] = ["PENDING", "PENDING_SETTLEMENT", "SETTLED"];

export const USER_STATUSES: UserStatus[] = ["PENDING", "ACTIVE", "SUSPENDED"];

export const DEFAULT_PAGE_SIZE = 12;

/** Selectable page sizes shown by the Pagination control. */
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

/** Demo credentials seeded by the backend (DataSeeder.java) — shown on the login screen. */
export const DEMO_CREDENTIALS = {
  admin: { email: "admin@b2b.local", password: "Admin@12345" },
  merchant: { email: "merchant@b2b.local", password: "Merchant@12345" },
  supplier: { email: "supplier@b2b.local", password: "Supplier@12345" },
};
