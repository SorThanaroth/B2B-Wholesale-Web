import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryClient";
import { getApiErrorMessage } from "@/lib/apiClient";
import { categoryService, companyService, productService } from "@/services/catalog.service";
import type {
  CategoryRequest,
  CompanyRequest,
  ProductQuery,
  ProductRequest,
} from "@/types/api";

/* ----------------------------- Companies (9.3) ----------------------------- */
export function useCompanies(params: { page?: number; size?: number; sort?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.companies(params),
    queryFn: () => companyService.list(params),
  });
}

export function useCompany(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.company(id ?? ""),
    queryFn: () => companyService.get(id as string),
    enabled: !!id,
  });
}

/** Admin-only full company detail (any status) — used to review supplier applications. */
export function useCompanyAdmin(id: string | undefined | null) {
  return useQuery({
    queryKey: queryKeys.companyAdmin(id ?? ""),
    queryFn: () => companyService.getAdmin(id as string),
    enabled: !!id,
  });
}

export function useSaveCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: CompanyRequest }) =>
      id ? companyService.update(id, body) : companyService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company saved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useDeactivateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companyService.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company deactivated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

/* ----------------------------- Categories (9.4) ---------------------------- */
export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: categoryService.tree });
}

export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: CategoryRequest }) =>
      id ? categoryService.update(id, body) : categoryService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success("Category saved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success("Category deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

/* ------------------------------ Products (9.5) ----------------------------- */
export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: queryKeys.products(query),
    queryFn: () => productService.list(query),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.product(id ?? ""),
    queryFn: () => productService.get(id as string),
    enabled: !!id,
  });
}

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: ProductRequest }) =>
      id ? productService.update(id, body) : productService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product saved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useDeactivateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deactivated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useImportProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, file }: { companyId: string; file: File }) =>
      productService.importCsv(companyId, file),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Imported ${result.imported} product(s), ${result.failed} failed`);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
