# B2B Wholesale Marketplace — Frontend

React 18 + TypeScript single-page app for the **B2B Wholesale Marketplace** (System Report v1.0 MVP
+ v1.1 supplier portal). It implements the **merchant storefront**, the **supplier portal**, and the
**admin console** against the Spring Boot API.

> One place to browse, order and pay every supplier in a single unified QR scan — with automatic
> per-company settlement behind the scenes.

## Tech stack

| Concern          | Choice                                                            |
| ---------------- | ----------------------------------------------------------------- |
| Framework        | React 18 + TypeScript + Vite                                      |
| Styling          | Tailwind CSS (navy/teal brand theme from the report)              |
| Icons            | [lucide-react](https://lucide.dev)                                |
| Routing          | React Router v6                                                   |
| Server state     | TanStack Query (React Query)                                      |
| Auth state       | React Context + `localStorage` (JWT access + refresh)             |
| HTTP             | Axios with a silent token-refresh interceptor                     |
| Charts           | Recharts (admin revenue report)                                   |
| Notifications    | react-hot-toast                                                   |

## Getting started

```bash
cd Frontend
npm install
cp .env.example .env      # adjust VITE_API_BASE_URL if the API isn't on :8082
npm run dev               # http://localhost:5173
```

The dev server runs on **port 5173**, which the backend already whitelists for CORS
(`SecurityConfig.java`). Make sure the API is running first:

```bash
cd ../Backend
./mvnw spring-boot:run    # serves http://localhost:8082/api/v1
```

### Demo accounts (seeded by the backend)

| Role     | Email                | Password         |
| -------- | -------------------- | ---------------- |
| Admin    | `admin@b2b.local`    | `Admin@12345`    |
| Merchant | `merchant@b2b.local` | `Merchant@12345` |
| Supplier | `supplier@b2b.local` | `Supplier@12345` |

The login screen has one-click buttons to fill these in. Each role lands on its own area
(merchant storefront, supplier portal, or admin console) and is route-guarded by `ProtectedRoute`.

## Scripts

| Script            | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                    |
| `npm run build`   | Type-check (`tsc -b`) and build for prod     |
| `npm run preview` | Preview the production build                 |
| `npm run lint`    | Type-check only (`tsc --noEmit`)             |

## Project structure

```
src/
├── components/
│   ├── common/      # PageHeader, StatCard, ProductCard, Avatar, Logo, QuantityStepper, OrderTables
│   ├── layout/      # DashboardLayout, Sidebar, UserMenu, ProtectedRoute, Auth/Merchant/Admin shells
│   └── ui/          # Design system: Button, Input, Select, Modal, Table, Badge, Pagination, States…
├── constants/       # Status → label/colour maps, routes, page sizes, demo creds
├── context/         # AuthContext (session + login/register/logout)
├── hooks/           # React Query hooks per domain (useCatalog, useCart, useOrders, useAdmin…)
├── lib/             # apiClient (axios + refresh), queryClient, storage, utils, categories
├── pages/
│   ├── auth/        # Login, Register, Forgot/Reset password, Verify email
│   ├── merchant/    # Dashboard, Catalog, Product, Cart, Checkout, Payment(QR), Orders, Profile
│   ├── supplier/    # Dashboard, My Products, Orders, Order detail, Settlements, My Company
│   └── admin/       # Dashboard, Companies, Products, Categories, Merchants, Suppliers, Orders, Settlements, Reports
├── services/        # Thin typed wrappers around each API section (9.1–9.11)
├── types/           # api.ts — TypeScript mirror of every backend DTO/enum
├── App.tsx          # Route table (merchant vs admin, role-guarded)
└── main.tsx         # Providers: QueryClient → Auth → Router
```

## How the key flows map to the report

- **Unified QR checkout (§8):** `Cart → Checkout → POST /orders/checkout` returns a `QrResponse`
  with a ready-to-render PNG data URI. `PaymentPage` shows the QR and **polls
  `/payments/{orderId}/status`** until the gateway webhook flips it to `PAID`. A
  *"Simulate payment"* button posts to `/payments/callback` so the flow can be demoed without a
  real bank app.
- **Multi-company settlement (§8.2):** order detail and the admin **Settlements** screen render the
  `order_company_splits` breakdown; admins mark each company's share `SETTLED` and export a CSV.
- **Wholesale-only (§7.3):** quantity steppers and the product page enforce each product's
  `minOrderQty`; the backend re-validates.
- **RBAC:** `ProtectedRoute area="MERCHANT|SUPPLIER|ADMIN"` gates each area; a user in the wrong
  area is redirected to their own home (`homeForRole`). The Axios layer refreshes JWTs transparently
  and forces a logout when the refresh token expires.
- **Supplier portal (v1.1, report §10 v1.3):** supplier accounts sign in to `/supplier/**` to manage
  *their own* company's catalog (CRUD + CSV), view orders containing their products (with their own
  share), and track their settlement payouts — all scoped server-side via the supplier's `companyId`.
- **Registration & approval:** the register screen lets a visitor choose **Merchant** or **Supplier**;
  choosing Supplier also collects company details and creates the company (supplier = company). All
  self-registrations are **PENDING admin approval** (no auto-login) — the page shows a "pending
  approval" screen and login is blocked with a clear message until approved. Admins can also create
  accounts directly (admin → **Merchants**/**Suppliers** → *New …*, active immediately) and **Approve**
  pending accounts inline; approving a supplier activates its company.

## Auth & token handling

`lib/apiClient.ts` attaches the access token to every request and, on a `401`, performs a
single-flight refresh via `POST /auth/refresh` before replaying the original request. If the
refresh fails, the session is cleared and the app returns to the login screen.
