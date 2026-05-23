import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { MerchantLayout } from "@/components/layout/MerchantLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SupplierLayout } from "@/components/layout/SupplierLayout";
import { useAuth } from "@/hooks/useAuth";
import { homeForRole, ROUTES } from "@/constants/routes";

// Auth
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";

// Merchant
import { MerchantDashboardPage } from "@/pages/merchant/MerchantDashboardPage";
import { CatalogPage } from "@/pages/merchant/CatalogPage";
import { ProductDetailPage } from "@/pages/merchant/ProductDetailPage";
import { CartPage } from "@/pages/merchant/CartPage";
import { CheckoutPage } from "@/pages/merchant/CheckoutPage";
import { PaymentPage } from "@/pages/merchant/PaymentPage";
import { OrdersPage } from "@/pages/merchant/OrdersPage";
import { OrderDetailPage } from "@/pages/merchant/OrderDetailPage";
import { ProfilePage } from "@/pages/merchant/ProfilePage";

// Admin
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminCompaniesPage } from "@/pages/admin/AdminCompaniesPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminCategoriesPage } from "@/pages/admin/AdminCategoriesPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminSuppliersPage } from "@/pages/admin/AdminSuppliersPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminOrderDetailPage } from "@/pages/admin/AdminOrderDetailPage";
import { AdminSettlementsPage } from "@/pages/admin/AdminSettlementsPage";
import { AdminReportsPage } from "@/pages/admin/AdminReportsPage";

// Supplier
import { SupplierDashboardPage } from "@/pages/supplier/SupplierDashboardPage";
import { SupplierProductsPage } from "@/pages/supplier/SupplierProductsPage";
import { SupplierOrdersPage } from "@/pages/supplier/SupplierOrdersPage";
import { SupplierOrderDetailPage } from "@/pages/supplier/SupplierOrderDetailPage";
import { SupplierSettlementsPage } from "@/pages/supplier/SupplierSettlementsPage";
import { SupplierCompanyPage } from "@/pages/supplier/SupplierCompanyPage";

import { NotFoundPage } from "@/pages/NotFoundPage";

/** Sends "/" to the right home depending on auth + role. */
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to={ROUTES.login} replace />;
  return <Navigate to={homeForRole(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Public auth */}
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.register} element={<RegisterPage />} />
      <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
      <Route path={ROUTES.verifyEmail} element={<VerifyEmailPage />} />

      {/* Merchant storefront */}
      <Route element={<ProtectedRoute area="MERCHANT" />}>
        <Route element={<MerchantLayout />}>
          <Route path={ROUTES.dashboard} element={<MerchantDashboardPage />} />
          <Route path={ROUTES.catalog} element={<CatalogPage />} />
          <Route path={ROUTES.product()} element={<ProductDetailPage />} />
          <Route path={ROUTES.cart} element={<CartPage />} />
          <Route path={ROUTES.checkout} element={<CheckoutPage />} />
          <Route path={ROUTES.payment()} element={<PaymentPage />} />
          <Route path={ROUTES.orders} element={<OrdersPage />} />
          <Route path={ROUTES.order()} element={<OrderDetailPage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Supplier portal */}
      <Route element={<ProtectedRoute area="SUPPLIER" />}>
        <Route element={<SupplierLayout />}>
          <Route path={ROUTES.supplierDashboard} element={<SupplierDashboardPage />} />
          <Route path={ROUTES.supplierProducts} element={<SupplierProductsPage />} />
          <Route path={ROUTES.supplierOrders} element={<SupplierOrdersPage />} />
          <Route path={ROUTES.supplierOrder()} element={<SupplierOrderDetailPage />} />
          <Route path={ROUTES.supplierSettlements} element={<SupplierSettlementsPage />} />
          <Route path={ROUTES.supplierCompany} element={<SupplierCompanyPage />} />
        </Route>
      </Route>

      {/* Admin console */}
      <Route element={<ProtectedRoute area="ADMIN" />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.adminDashboard} element={<AdminDashboardPage />} />
          <Route path={ROUTES.adminCompanies} element={<AdminCompaniesPage />} />
          <Route path={ROUTES.adminProducts} element={<AdminProductsPage />} />
          <Route path={ROUTES.adminCategories} element={<AdminCategoriesPage />} />
          <Route path={ROUTES.adminUsers} element={<AdminUsersPage />} />
          <Route path={ROUTES.adminSuppliers} element={<AdminSuppliersPage />} />
          <Route path={ROUTES.adminOrders} element={<AdminOrdersPage />} />
          <Route path={ROUTES.adminOrder()} element={<AdminOrderDetailPage />} />
          <Route path={ROUTES.adminSettlements} element={<AdminSettlementsPage />} />
          <Route path={ROUTES.adminReports} element={<AdminReportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
