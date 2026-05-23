import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryClient";
import { getApiErrorMessage } from "@/lib/apiClient";
import { supplierService } from "@/services/supplier.service";
import type { OrderStatus, SplitStatus, SupplierProductRequest } from "@/types/api";

/* ------------------------------- Overview ---------------------------------- */
export function useSupplierDashboard() {
  return useQuery({
    queryKey: queryKeys.supplierDashboard,
    queryFn: supplierService.dashboard,
  });
}

export function useSupplierCompany() {
  return useQuery({
    queryKey: queryKeys.supplierCompany,
    queryFn: supplierService.myCompany,
  });
}

/* ------------------------------- Products ---------------------------------- */
export function useSupplierProducts(params: { search?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: queryKeys.supplierProducts(params),
    queryFn: () => supplierService.listProducts(params),
  });
}

export function useSaveSupplierProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: SupplierProductRequest }) =>
      id ? supplierService.updateProduct(id, body) : supplierService.createProduct(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supplier-products"] });
      qc.invalidateQueries({ queryKey: queryKeys.supplierDashboard });
      toast.success("Product saved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useDeactivateSupplierProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplierService.deactivateProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supplier-products"] });
      toast.success("Product deactivated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useImportSupplierProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => supplierService.importProducts(file),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["supplier-products"] });
      toast.success(`Imported ${result.imported} product(s), ${result.failed} failed`);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

/* -------------------------------- Orders ----------------------------------- */
export function useSupplierOrders(params: { status?: OrderStatus; page?: number; size?: number }) {
  return useQuery({
    queryKey: queryKeys.supplierOrders(params),
    queryFn: () => supplierService.listOrders(params),
  });
}

export function useSupplierOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.supplierOrder(id ?? ""),
    queryFn: () => supplierService.getOrder(id as string),
    enabled: !!id,
  });
}

/* ----------------------------- Settlements --------------------------------- */
export function useSupplierSettlements(params: { status?: SplitStatus; page?: number; size?: number }) {
  return useQuery({
    queryKey: queryKeys.supplierSettlements(params),
    queryFn: () => supplierService.listSettlements(params),
  });
}
