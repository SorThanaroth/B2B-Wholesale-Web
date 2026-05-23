import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
        <Compass className="h-8 w-8" />
      </span>
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="max-w-sm text-slate-500">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
