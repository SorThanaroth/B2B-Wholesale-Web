import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryClient";
import { getApiErrorMessage } from "@/lib/apiClient";
import { userService } from "@/services/user.service";
import type {
  AddressRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "@/types/api";

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: userService.getProfile });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => userService.updateProfile(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => userService.changePassword(body),
    onSuccess: () => toast.success("Password changed"),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useAddresses() {
  return useQuery({ queryKey: queryKeys.addresses, queryFn: userService.listAddresses });
}

export function useSaveAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: AddressRequest }) =>
      id ? userService.updateAddress(id, body) : userService.addAddress(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.addresses });
      toast.success("Address saved");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteAddress(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.addresses });
      toast.success("Address removed");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
