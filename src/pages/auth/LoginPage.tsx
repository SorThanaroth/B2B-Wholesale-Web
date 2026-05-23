import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/apiClient";
import { homeForRole, ROUTES } from "@/constants/routes";
import { DEMO_CREDENTIALS } from "@/constants";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login({ email, password });
      const from = (location.state as { from?: Location })?.from?.pathname;
      navigate(from ?? homeForRole(user.role), { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (which: keyof typeof DEMO_CREDENTIALS) => {
    setEmail(DEMO_CREDENTIALS[which].email);
    setPassword(DEMO_CREDENTIALS[which].password);
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your merchant or admin account.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          icon={<Mail className="h-4 w-4" />}
          placeholder="you@business.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          icon={<KeyRound className="h-4 w-4" />}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end">
          <Link
            to={ROUTES.forgotPassword}
            className="text-sm font-medium text-accent-600 hover:text-accent-700"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">
        <p className="mb-2 font-medium text-slate-600">Demo accounts</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fillDemo("merchant")}
            className="rounded-md bg-white px-2.5 py-1 font-medium text-slate-700 ring-1 ring-slate-200 hover:ring-accent-300"
          >
            Use merchant
          </button>
          <button
            type="button"
            onClick={() => fillDemo("supplier")}
            className="rounded-md bg-white px-2.5 py-1 font-medium text-slate-700 ring-1 ring-slate-200 hover:ring-accent-300"
          >
            Use supplier
          </button>
          <button
            type="button"
            onClick={() => fillDemo("admin")}
            className="rounded-md bg-white px-2.5 py-1 font-medium text-slate-700 ring-1 ring-slate-200 hover:ring-accent-300"
          >
            Use admin
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        New merchant?{" "}
        <Link to={ROUTES.register} className="font-medium text-accent-600 hover:text-accent-700">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
