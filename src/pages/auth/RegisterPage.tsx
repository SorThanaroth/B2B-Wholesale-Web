import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Building,
  Building2,
  CreditCard,
  KeyRound,
  Mail,
  MailCheck,
  Phone,
  ShoppingCart,
  Store,
} from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Button, Input } from "@/components/ui";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { Role } from "@/types/api";

type AccountType = Extract<Role, "MERCHANT" | "SUPPLIER">;

const ACCOUNT_TYPES: { value: AccountType; label: string; hint: string; icon: typeof Store }[] = [
  { value: "MERCHANT", label: "Merchant", hint: "I buy wholesale", icon: ShoppingCart },
  { value: "SUPPLIER", label: "Supplier", hint: "I sell / list products", icon: Store },
];

export function RegisterPage() {
  const [role, setRole] = useState<AccountType>("MERCHANT");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    bankAccount: "",
    contactEmail: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role,
        ...(role === "SUPPLIER"
          ? {
              companyName: form.companyName,
              bankAccount: form.bankAccount,
              contactEmail: form.contactEmail || undefined,
            }
          : {}),
      });
      setSubmitted(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create account"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthShell title="Registration received">
        <div className="space-y-6">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Your {role.toLowerCase()} account is pending approval.</p>
              <p className="mt-1">
                An administrator will review and activate it shortly. You’ll be able to sign in once
                it’s approved.
              </p>
            </div>
          </div>
          <Link to={ROUTES.login}>
            <Button className="w-full">Back to sign in</Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Choose how you’ll use the marketplace, then tell us about yourself."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Account type selector */}
        <div>
          <span className="label">I’m registering as a…</span>
          <div className="grid grid-cols-2 gap-3">
            {ACCOUNT_TYPES.map(({ value, label, hint, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition",
                  role === value
                    ? "border-accent-500 bg-accent-50 ring-2 ring-accent-500/30"
                    : "border-slate-300 hover:border-slate-400",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", role === value ? "text-accent-600" : "text-slate-400")}
                />
                <span className="text-sm font-semibold text-slate-800">{label}</span>
                <span className="text-xs text-slate-500">{hint}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Full name"
          required
          icon={<Building className="h-4 w-4" />}
          placeholder="Your name"
          value={form.fullName}
          onChange={set("fullName")}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          icon={<Mail className="h-4 w-4" />}
          placeholder="you@business.com"
          value={form.email}
          onChange={set("email")}
        />
        <Input
          label="Phone (optional)"
          type="tel"
          icon={<Phone className="h-4 w-4" />}
          placeholder="+855 12 000 000"
          value={form.phone}
          onChange={set("phone")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          icon={<KeyRound className="h-4 w-4" />}
          placeholder="At least 8 characters"
          value={form.password}
          onChange={set("password")}
        />

        {/* Supplier-only: company details (supplier = company) */}
        {role === "SUPPLIER" && (
          <div className="space-y-4 rounded-lg border border-dashed border-accent-300 bg-accent-50/40 p-4">
            <p className="flex items-center gap-1.5 text-sm font-medium text-accent-800">
              <Building2 className="h-4 w-4" />
              Your company
            </p>
            <Input
              label="Company name"
              required
              placeholder="e.g. Angkor Water Co."
              value={form.companyName}
              onChange={set("companyName")}
            />
            <Input
              label="Settlement bank account"
              required
              icon={<CreditCard className="h-4 w-4" />}
              placeholder="e.g. ABA-000111222"
              hint="Where your payouts will be settled."
              value={form.bankAccount}
              onChange={set("bankAccount")}
            />
            <Input
              label="Company contact email (optional)"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              placeholder="orders@company.com"
              value={form.contactEmail}
              onChange={set("contactEmail")}
            />
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link to={ROUTES.login} className="font-medium text-accent-600 hover:text-accent-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
