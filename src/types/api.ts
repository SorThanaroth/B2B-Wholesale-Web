/**
 * TypeScript mirror of the backend DTOs (Spring Boot `com.wholesale.marketplace`).
 * Kept 1:1 with the Java records so the API contract is the single source of truth.
 * BigDecimal / Instant serialize to JSON as `number`-like string and ISO string —
 * we model money as `number` (Jackson emits JSON numbers) and timestamps as `string`.
 */

// ---------- Enums ----------
export type Role = "MERCHANT" | "SUPPLIER" | "ADMIN";
export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";
export type CompanyStatus = "ACTIVE" | "INACTIVE";
export type ProductStatus = "ACTIVE" | "INACTIVE";
export type CartStatus = "ACTIVE" | "CHECKED_OUT";
export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";
export type SplitStatus = "PENDING" | "PENDING_SETTLEMENT" | "SETTLED";
export type FulfillmentStatus = "PROCESSING" | "SHIPPED" | "DELIVERED";

// ---------- Generic envelopes ----------
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string> | null;
}

// ---------- Auth (9.1) ----------
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  fullName: string;
  email: string;
  role: Role;
  /** Set only for SUPPLIER accounts. */
  companyId?: string | null;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  /** MERCHANT (buyer) or SUPPLIER (seller); defaults to MERCHANT. */
  role?: Role;
  // Supplier-only — creates the company (supplier = company). Reviewed by admin before approval.
  companyName?: string;
  bankAccount?: string;
  contactEmail?: string;
  registrationNo?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyDescription?: string;
}

/** Self-registration result — accounts are PENDING until an admin approves them. */
export interface RegistrationResponse {
  message: string;
  role: Role;
  status: UserStatus;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ---------- User / Profile (9.2) ----------
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  /** Populated for SUPPLIER accounts. */
  companyId?: string | null;
  companyName?: string | null;
}

export interface CreateMerchantRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface CreateSupplierRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  companyId: string;
}

export interface AssignCompanyRequest {
  companyId: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Address {
  id: string;
  label?: string | null;
  street: string;
  city: string;
  province?: string | null;
  isDefault: boolean;
}

export interface AddressRequest {
  label?: string;
  street: string;
  city: string;
  province?: string;
  isDefault: boolean;
}

// ---------- Companies (9.3) ----------
export interface Company {
  id: string;
  name: string;
  logoUrl?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
  status: CompanyStatus;
  createdAt: string;
}

export interface CompanyAdmin extends Company {
  bankAccount: string;
  registrationNo?: string | null;
}

export interface CompanyRequest {
  name: string;
  logoUrl?: string;
  bankAccount: string;
  contactEmail?: string;
  registrationNo?: string;
  phone?: string;
  address?: string;
  description?: string;
}

// ---------- Categories (9.4) ----------
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  children: Category[];
}

export interface CategoryRequest {
  name: string;
  description?: string;
  parentId?: string | null;
}

// ---------- Products (9.5) ----------
export interface Product {
  id: string;
  companyId: string;
  companyName: string;
  categoryId?: string | null;
  categoryName?: string | null;
  name: string;
  description?: string | null;
  price: number;
  minOrderQty: number;
  unit: string;
  stock: number;
  imageUrl?: string | null;
  status: ProductStatus;
  createdAt: string;
}

export interface ProductRequest {
  companyId: string;
  categoryId?: string | null;
  name: string;
  description?: string;
  price: number;
  minOrderQty: number;
  unit: string;
  stock: number;
  imageUrl?: string;
}

export interface ProductQuery {
  company?: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: string[];
}

// ---------- Cart (9.6) ----------
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  minOrderQty: number;
  subtotal: number;
}

export interface CartCompanyGroup {
  companyId: string;
  companyName: string;
  subtotal: number;
  items: CartItem[];
}

export interface Cart {
  cartId: string;
  companies: CartCompanyGroup[];
  grandTotal: number;
  totalItems: number;
}

export interface AddItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateItemRequest {
  quantity: number;
}

// ---------- Orders (9.7) ----------
export interface OrderSummary {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  companyId: string;
  companyName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderSplit {
  id: string;
  companyId: string;
  companyName: string;
  subtotal: number;
  paymentStatus: SplitStatus;
  fulfillmentStatus: FulfillmentStatus;
  paidAt?: string | null;
  settledAt?: string | null;
}

export interface OrderDetail {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  qrToken: string;
  createdAt: string;
  items: OrderItem[];
  splits: OrderSplit[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface AdminOrderQuery {
  status?: OrderStatus;
  company?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// ---------- Payments (9.8) ----------
export interface QrResponse {
  orderId: string;
  qrToken: string;
  qrPayload: string;
  qrImageDataUri: string;
  amount: number;
  status: PaymentStatus;
}

export interface PaymentStatusResponse {
  orderId: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  amount: number;
  paidAt?: string | null;
}

export interface CallbackRequest {
  reference: string;
  status: "PAID" | "FAILED";
}

// ---------- Settlements (9.9) ----------
export interface Settlement {
  splitId: string;
  orderId: string;
  companyId: string;
  companyName: string;
  bankAccount: string;
  subtotal: number;
  status: SplitStatus;
  fulfillmentStatus: FulfillmentStatus;
  paidAt?: string | null;
  settledAt?: string | null;
}

export interface SettlementQuery {
  company?: string;
  status?: SplitStatus;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

// ---------- Admin user management (9.10) ----------
export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export interface UpdateUserRoleRequest {
  role: Role;
}

// ---------- Dashboards & Reports (9.11) ----------
export interface CompanySpend {
  companyId: string;
  companyName: string;
  amount: number;
  orderCount: number;
}

export interface MerchantDashboard {
  totalOrders: number;
  pendingPayments: number;
  totalSpent: number;
  recentOrders: OrderSummary[];
  spendingByCompany: CompanySpend[];
}

export interface AdminDashboard {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  activeMerchants: number;
  activeCompanies: number;
  pendingSettlements: number;
}

export interface RevenueRow {
  companyId: string;
  companyName: string;
  revenue: number;
  orderCount: number;
}

export interface TopProductRow {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface MerchantActivityRow {
  userId: string;
  fullName: string;
  orderCount: number;
  totalSpent: number;
}

// ---------- Supplier portal (v1.1) ----------
export interface SupplierProductRequest {
  categoryId?: string | null;
  name: string;
  description?: string;
  price: number;
  minOrderQty: number;
  unit: string;
  stock: number;
  imageUrl?: string;
}

export interface SupplierOrderRow {
  orderId: string;
  createdAt: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  companySubtotal: number;
  settlementStatus?: SplitStatus | null;
  fulfillmentStatus?: FulfillmentStatus | null;
  splitId?: string | null;
  paidAt?: string | null;
}

export interface SupplierOrderDetail {
  orderId: string;
  splitId: string;
  createdAt: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  companySubtotal: number;
  settlementStatus?: SplitStatus | null;
  fulfillmentStatus: FulfillmentStatus;
  paidAt?: string | null;
  settledAt?: string | null;
  items: OrderItem[];
}

export interface UpdateFulfillmentRequest {
  status: FulfillmentStatus;
}

export interface SupplierDashboard {
  totalProducts: number;
  activeProducts: number;
  ordersInvolved: number;
  pendingSettlementAmount: number;
  settledAmount: number;
  recentOrders: SupplierOrderRow[];
}
