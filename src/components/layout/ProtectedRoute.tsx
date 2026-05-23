import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { homeForRole, ROUTES } from "@/constants/routes";
import type { Role } from "@/types/api";

/**
 * Gate for authenticated routes. `area` is the role this section belongs to
 * (MERCHANT storefront, SUPPLIER portal, ADMIN console). A user whose role
 * doesn't match the area is redirected to their own home rather than shown a
 * forbidden screen.
 */
export function ProtectedRoute({ area }: { area: Role }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (user.role !== area) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return <Outlet />;
}
