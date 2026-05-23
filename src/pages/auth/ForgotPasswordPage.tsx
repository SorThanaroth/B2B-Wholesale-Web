import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Button, Input } from "@/components/ui";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/apiClient";
import { ROUTES } from "@/constants/routes";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we’ll send a reset link."
    >
      {sent ? (
        <div className="space-y-6">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">
              If <strong>{email}</strong> is registered, a password reset link is on its way.
              Check your inbox and spam folder.
            </p>
          </div>
          <Link to={ROUTES.login}>
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            required
            icon={<Mail className="h-4 w-4" />}
            placeholder="you@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Send reset link
          </Button>
          <Link
            to={ROUTES.login}
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
