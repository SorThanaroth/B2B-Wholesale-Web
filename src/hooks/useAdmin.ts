import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryClient";
import { getApiErrorMessage } from "@/lib/apiClient";
import { adminUserService } from "@/services/user.service";
import { settlementService } from "@/services/settlement.service";
import { reportService } from "@/services/report.service";
import type {
  AssignCompanyRequest,
  CreateMerchantRequest,
  CreateSupplierRequest,
  Role,
  SettlementQuery,
  UserStatus,
} from "@/types/api";

/* --------------------------- Dashboards (9.11) ----------------------------- */
export function useMerchantDashboard() {
  return useQuery({
    queryKey: queryKeys.merchantDashboard,
    queryFn: reportService.merchantDashboard,
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: reportService.adminDashboard,
  });
}

/* ------------------------- Admin user management (9.10) -------------------- */
export function useAdminUsers(params: { search?: string; role?: Role; page?: number; size?: number }) {
  return useQuery({
    queryKey: queryKeys.adminUsers(params),
    queryFn: () => adminUserService.list(params),
  });
}

export function useCreateMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMerchantRequest) => adminUserService.createMerchant(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Merchant account created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSupplierRequest) => adminUserService.createSupplier(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Supplier account created");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useAssignCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AssignCompanyRequest }) =>
      adminUserService.assignCompany(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Company reassigned");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      adminUserService.updateStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Account status updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      adminUserService.updateRole(id, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

/* ----------------------------- Settlements (9.9) --------------------------- */
export function useSettlements(query: SettlementQuery) {
  return useQuery({
    queryKey: queryKeys.settlements(query),
    queryFn: () => settlementService.list(query),
  });
}

export function useSettleSplit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (splitId: string) => settlementService.settle(splitId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settlements"] });
      qc.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      toast.success("Marked as settled");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useDownloadSettlementReport() {
  return useMutation({
    mutationFn: (query: Omit<SettlementQuery, "page" | "size">) =>
      settlementService.reportCsv(query),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "settlement-report.csv";
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

/* ------------------------------- Reports (9.11) ---------------------------- */
export function useRevenueReport(params: { from?: string; to?: string }) {
  return useQuery({
    queryKey: queryKeys.reportRevenue(params),
    queryFn: () => reportService.revenue(params),
  });
}

export function useTopProductsReport(limit = 10) {
  return useQuery({
    queryKey: queryKeys.reportProducts(limit),
    queryFn: () => reportService.topProducts(limit),
  });
}

export function useMerchantActivityReport(limit = 10) {
  return useQuery({
    queryKey: queryKeys.reportMerchants(limit),
    queryFn: () => reportService.merchants(limit),
  });
}
