import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Button, Spinner } from "@/components/ui";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/apiClient";
import { ROUTES } from "@/constants/routes";

type Status = "verifying" | "success" | "error";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard StrictMode double-invoke
    ran.current = true;

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }
    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(getApiErrorMessage(err, "This verification link is invalid or expired."));
      });
  }, [token]);

  return (
    <AuthShell title="Email verification">
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        {status === "verifying" && (
          <>
            <Spinner className="h-10 w-10 text-accent-500" />
            <p className="text-slate-500">Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="font-medium text-slate-700">{message}</p>
            <Link to={ROUTES.login}>
              <Button>Continue to sign in</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="font-medium text-slate-700">{message}</p>
            <Link to={ROUTES.login}>
              <Button variant="outline">Back to sign in</Button>
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
