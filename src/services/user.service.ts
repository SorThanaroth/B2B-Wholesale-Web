import { api } from "@/lib/apiClient";
import { cleanParams } from "@/lib/utils";
import type {
  Address,
  AddressRequest,
  AssignCompanyRequest,
  ChangePasswordRequest,
  CreateMerchantRequest,
  CreateSupplierRequest,
  PageResponse,
  Role,
  UpdateProfileRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  UserProfile,
} from "@/types/api";

/** Section 9.2 — current user profile + addresses. */
export const userService = {
  getProfile: () => api.get<UserProfile>("/users/me").then((r) => r.data),

  updateProfile: (body: UpdateProfileRequest) =>
    api.put<UserProfile>("/users/me", body).then((r) => r.data),

  changePassword: (body: ChangePasswordRequest) =>
    api.put<void>("/users/me/password", body).then((r) => r.data),

  listAddresses: () => api.get<Address[]>("/users/me/addresses").then((r) => r.data),

  addAddress: (body: AddressRequest) =>
    api.post<Address>("/users/me/addresses", body).then((r) => r.data),

  updateAddress: (id: string, body: AddressRequest) =>
    api.put<Address>(`/users/me/addresses/${id}`, body).then((r) => r.data),

  deleteAddress: (id: string) =>
    api.delete<void>(`/users/me/addresses/${id}`).then((r) => r.data),
};

/** Section 9.10 — admin user management (merchants + supplier provisioning). */
export const adminUserService = {
  list: (params: { search?: string; role?: Role; page?: number; size?: number }) =>
    api
      .get<PageResponse<UserProfile>>("/admin/users", { params: cleanParams(params) })
      .then((r) => r.data),

  get: (id: string) => api.get<UserProfile>(`/admin/users/${id}`).then((r) => r.data),

  createMerchant: (body: CreateMerchantRequest) =>
    api.post<UserProfile>("/admin/users/merchant", body).then((r) => r.data),

  createSupplier: (body: CreateSupplierRequest) =>
    api.post<UserProfile>("/admin/users/supplier", body).then((r) => r.data),

  assignCompany: (id: string, body: AssignCompanyRequest) =>
    api.put<UserProfile>(`/admin/users/${id}/company`, body).then((r) => r.data),

  updateStatus: (id: string, body: UpdateUserStatusRequest) =>
    api.put<UserProfile>(`/admin/users/${id}/status`, body).then((r) => r.data),

  updateRole: (id: string, body: UpdateUserRoleRequest) =>
    api.put<UserProfile>(`/admin/users/${id}/role`, body).then((r) => r.data),
};
