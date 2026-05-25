import { useMemo, useState, type FormEvent } from "react";
import { Building2, CheckCircle2, Eye, Plus, Search } from "lucide-react";
import { useAdminUsers, useCreateSupplier, useUpdateUserStatus } from "@/hooks/useAdmin";
import { useCompanies } from "@/hooks/useCatalog";
import { useDebounce } from "@/hooks/useDebounce";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar } from "@/components/common/Avatar";
import { SupplierReviewModal } from "@/components/admin/SupplierReviewModal";
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Modal,
  Pagination,
  Select,
  UserStatusBadge,
  type Column,
  type SelectOption,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { CreateSupplierRequest, UserProfile } from "@/types/api";

const EMPTY: CreateSupplierRequest = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  companyId: "",
};

export function AdminSuppliersPage() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);

  const params = useMemo(
    () => ({ role: "SUPPLIER" as const, search: search || undefined, page, size: 12 }),
    [search, page],
  );
  const { data, isLoading, isError, error, refetch } = useAdminUsers(params);
  const { data: companies } = useCompanies({ size: 100 });
  const createSupplier = useCreateSupplier();
  const updateStatus = useUpdateUserStatus();

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateSupplierRequest>(EMPTY);
  const [reviewing, setReviewing] = useState<UserProfile | null>(null);

  const companyOptions: SelectOption[] =
    companies?.content.map((c) => ({ value: c.id, label: c.name })) ?? [];

  const submitCreate = (e: FormEvent) => {
    e.preventDefault();
    createSupplier.mutate(
      { ...form, phone: form.phone || undefined },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setForm(EMPTY);
        },
      },
    );
  };

  const pendingCount = data?.content.filter((u) => u.status === "PENDING").length ?? 0;

  const columns: Column<UserProfile>[] = [
    {
      key: "user",
      header: "Representative",
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.fullName} />
          <div>
            <p className="font-medium text-slate-800">{u.fullName}</p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: (u) => (
        <span className="inline-flex items-center gap-1.5 text-slate-700">
          <Building2 className="h-4 w-4 text-accent-500" />
          {u.companyName ?? "—"}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (u) => <UserStatusBadge status={u.status} /> },
    { key: "joined", header: "Applied", render: (u) => formatDate(u.createdAt) },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (u) => (
        <div className="flex justify-end gap-2">
          {u.status === "PENDING" && (
            <Button
              size="sm"
              variant="secondary"
              loading={updateStatus.isPending && updateStatus.variables?.id === u.id}
              onClick={() => updateStatus.mutate({ id: u.id, status: "ACTIVE" })}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setReviewing(u)}>
            <Eye className="h-4 w-4" />
            Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Suppliers"
        subtitle={
          pendingCount > 0
            ? `${pendingCount} application(s) awaiting review`
            : "Review applications, approve accounts and bind them to a company."
        }
        actions={
          <Button onClick={() => setCreateOpen(true)} disabled={companyOptions.length === 0}>
            <Plus className="h-4 w-4" />
            New supplier
          </Button>
        }
      />

      <div className="mb-4 max-w-md">
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Search suppliers…"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(0);
          }}
        />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data && data.content.length > 0 ? (
        <Card>
          <DataTable columns={columns} rows={data.content} rowKey={(u) => u.id} />
          <div className="px-4">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onChange={setPage}
            />
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={Building2}
            title="No supplier accounts yet"
            description="Suppliers can self-register (pending your approval), or create one here."
            action={
              <Button onClick={() => setCreateOpen(true)} disabled={companyOptions.length === 0}>
                <Plus className="h-4 w-4" />
                New supplier
              </Button>
            }
          />
        </Card>
      )}

      {/* Create supplier (admin-provisioned, active immediately) */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New supplier account"
        description="Bound to an existing company; active immediately."
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button form="create-supplier-form" type="submit" loading={createSupplier.isPending}>
              Create supplier
            </Button>
          </>
        }
      >
        <form id="create-supplier-form" onSubmit={submitCreate} className="space-y-4">
          <Select
            label="Company"
            required
            placeholder="Select company"
            options={companyOptions}
            value={form.companyId}
            onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))}
          />
          <Input
            label="Full name"
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Password"
              type="password"
              required
              minLength={8}
              hint="Min 8 characters"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <Input
              label="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
        </form>
      </Modal>

      {/* Review / approve supplier application */}
      <SupplierReviewModal
        supplier={reviewing}
        companyOptions={companyOptions}
        onClose={() => setReviewing(null)}
      />
    </>
  );
}
