import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Ban,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Hash,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useCompanyAdmin } from "@/hooks/useCatalog";
import { useAssignCompany, useUpdateUserStatus } from "@/hooks/useAdmin";
import { Avatar } from "@/components/common/Avatar";
import {
  Button,
  CompanyStatusBadge,
  LoadingState,
  Modal,
  Select,
  UserStatusBadge,
  type SelectOption,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { USER_STATUSES } from "@/constants";
import type { UserProfile, UserStatus } from "@/types/api";

function DetailRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="break-words text-sm font-medium text-slate-700">{value || "—"}</p>
      </div>
    </div>
  );
}

/**
 * Admin review of a supplier application: shows the rep + full company KYC detail
 * (incl. bank account, registration no.) so the admin can vet it before approving.
 */
export function SupplierReviewModal({
  supplier,
  companyOptions,
  onClose,
}: {
  supplier: UserProfile | null;
  companyOptions: SelectOption[];
  onClose: () => void;
}) {
  const [status, setStatus] = useState<UserStatus>("PENDING");
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    if (supplier) {
      setStatus(supplier.status);
      setCompanyId(supplier.companyId ?? "");
    }
  }, [supplier]);

  const { data: company, isLoading } = useCompanyAdmin(supplier?.companyId);
  const updateStatus = useUpdateUserStatus();
  const assignCompany = useAssignCompany();

  if (!supplier) return null;

  const changeStatus = (next: UserStatus) =>
    updateStatus.mutate({ id: supplier.id, status: next }, { onSuccess: () => setStatus(next) });

  return (
    <Modal
      open={!!supplier}
      onClose={onClose}
      size="lg"
      title="Review supplier"
      description={supplier.email}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex gap-2">
            {status !== "ACTIVE" && (
              <Button
                variant="secondary"
                loading={updateStatus.isPending}
                onClick={() => changeStatus("ACTIVE")}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
            )}
            {status !== "SUSPENDED" && (
              <Button
                variant="danger"
                loading={updateStatus.isPending}
                onClick={() => changeStatus("SUSPENDED")}
              >
                <Ban className="h-4 w-4" />
                {status === "PENDING" ? "Reject" : "Suspend"}
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Representative + status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={supplier.fullName} size="lg" />
            <div>
              <p className="font-semibold text-slate-800">{supplier.fullName}</p>
              <p className="text-sm text-slate-400">
                Applied {formatDate(supplier.createdAt)} · {supplier.phone || "no phone"}
              </p>
            </div>
          </div>
          <UserStatusBadge status={status} />
        </div>

        {/* Company KYC detail under review */}
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Building2 className="h-4 w-4 text-accent-600" />
              {company?.name ?? supplier.companyName ?? "Company"}
            </p>
            {company && <CompanyStatusBadge status={company.status} />}
          </div>
          {isLoading ? (
            <LoadingState label="Loading company details…" />
          ) : company ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow icon={Hash} label="Business reg. no." value={company.registrationNo} />
              <DetailRow icon={CreditCard} label="Settlement bank account" value={company.bankAccount} />
              <DetailRow icon={Mail} label="Contact email" value={company.contactEmail} />
              <DetailRow icon={Phone} label="Company phone" value={company.phone} />
              <DetailRow icon={MapPin} label="Address" value={company.address} />
              <DetailRow icon={FileText} label="About" value={company.description} />
            </div>
          ) : (
            <p className="text-sm text-slate-400">No company linked to this account.</p>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Linked company"
            value={companyId}
            placeholder="Select company"
            options={companyOptions}
            onChange={(e) => {
              const next = e.target.value;
              assignCompany.mutate(
                { id: supplier.id, body: { companyId: next } },
                { onSuccess: () => setCompanyId(next) },
              );
            }}
          />
          <Select
            label="Account status"
            value={status}
            options={USER_STATUSES.map((s) => ({ value: s, label: s }))}
            onChange={(e) => changeStatus(e.target.value as UserStatus)}
          />
        </div>

        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Approving activates the supplier <em>and</em> their company so its catalog goes live.
          Reassigning the company immediately changes which catalog they manage.
        </p>
      </div>
    </Modal>
  );
}
