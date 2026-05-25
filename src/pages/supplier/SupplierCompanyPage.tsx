import { FileText, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { useSupplierCompany } from "@/hooks/useSupplier";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar } from "@/components/common/Avatar";
import {
  Card,
  CardBody,
  CompanyStatusBadge,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";

export function SupplierCompanyPage() {
  const { data: company, isLoading, isError, error, refetch } = useSupplierCompany();

  if (isLoading) return <LoadingState />;
  if (isError || !company) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader title="My company" subtitle="Your company profile on the marketplace." />

      <Card className="max-w-2xl">
        <CardBody className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar name={company.name} src={company.logoUrl} size="lg" square />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{company.name}</h2>
              <CompanyStatusBadge status={company.status} />
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <dt className="text-xs text-slate-400">Contact email</dt>
                <dd className="text-sm font-medium text-slate-700">{company.contactEmail ?? "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <dt className="text-xs text-slate-400">Phone</dt>
                <dd className="text-sm font-medium text-slate-700">{company.phone ?? "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:col-span-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <dt className="text-xs text-slate-400">Address</dt>
                <dd className="text-sm font-medium text-slate-700">{company.address ?? "—"}</dd>
              </div>
            </div>
            {company.description && (
              <div className="flex items-start gap-3 sm:col-span-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <dt className="text-xs text-slate-400">About</dt>
                  <dd className="text-sm font-medium text-slate-700">{company.description}</dd>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <dt className="text-xs text-slate-400">On platform since</dt>
                <dd className="text-sm font-medium text-slate-700">{formatDate(company.createdAt)}</dd>
              </div>
            </div>
          </dl>

          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Need to update your company details or settlement bank account? Contact a platform
            administrator — these are managed centrally for settlement security.
          </p>
        </CardBody>
      </Card>
    </>
  );
}
