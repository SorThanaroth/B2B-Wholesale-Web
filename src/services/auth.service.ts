import { api } from "@/lib/apiClient";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  RegistrationResponse,
  ResetPasswordRequest,
} from "@/types/api";

/** Section 9.1 — Authentication. */
export const authService = {
  /** Self-registration. Returns a pending-approval message (no tokens). */
  register: (body: RegisterRequest) =>
    api.post<RegistrationResponse>("/auth/register", body).then((r) => r.data),

  login: (body: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", body).then((r) => r.data),

  logout: (body: RefreshRequest) => api.post<void>("/auth/logout", body).then((r) => r.data),

  verifyEmail: (token: string) =>
    api.get<{ message: string }>("/auth/verify-email", { params: { token } }).then((r) => r.data),

  forgotPassword: (body: ForgotPasswordRequest) =>
    api.post<{ message: string }>("/auth/forgot-password", body).then((r) => r.data),

  resetPassword: (body: ResetPasswordRequest) =>
    api.post<{ message: string }>("/auth/reset-password", body).then((r) => r.data),
};
