import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Plus, Search, ShieldCheck, UserCog } from "lucide-react";
import {
  useAdminUsers,
  useCreateMerchant,
  useUpdateUserRole,
  useUpdateUserStatus,
} from "@/hooks/useAdmin";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar } from "@/components/common/Avatar";
import {
  Badge,
  Button,
  Card,
  DataTable,
  ErrorState,
  Input,
  LoadingState,
  Modal,
  Pagination,
  Select,
  UserStatusBadge,
  type Column,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { USER_STATUSES } from "@/constants";
import type { CreateMerchantRequest, Role, UserProfile, UserStatus } from "@/types/api";

const EMPTY: CreateMerchantRequest = { fullName: "", email: "", password: "", phone: "" };

export function AdminUsersPage() {
  const { page, size, setPage, setSize } = usePagination();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);

  const params = useMemo(() => ({ page, size, search: search || undefined }), [page, size, search]);

  const { data, isLoading, isError, error, refetch } = useAdminUsers(params);
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();
  const createMerchant = useCreateMerchant();

  const [managing, setManaging] = useState<UserProfile | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateMerchantRequest>(EMPTY);

  const submitCreate = (e: FormEvent) => {
    e.preventDefault();
    createMerchant.mutate(
      { ...form, phone: form.phone || undefined },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setForm(EMPTY);
        },
      },
    );
  };

  const columns: Column<UserProfile>[] = [
    {
      key: "user",
      header: "Merchant",
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
      key: "role",
      header: "Role",
      render: (u) => (
        <Badge tone={u.role === "ADMIN" ? "info" : "neutral"}>
          {u.role === "ADMIN" ? <ShieldCheck className="h-3 w-3" /> : null}
          {u.role}
        </Badge>
      ),
    },
    { key: "status", header: "Status", render: (u) => <UserStatusBadge status={u.status} /> },
    {
      key: "verified",
      header: "Email",
      render: (u) => (
        <Badge tone={u.emailVerified ? "success" : "warning"}>
          {u.emailVerified ? "Verified" : "Unverified"}
        </Badge>
      ),
    },
    { key: "joined", header: "Joined", render: (u) => formatDate(u.createdAt) },
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
          <Button size="sm" variant="outline" onClick={() => setManaging(u)}>
            <UserCog className="h-4 w-4" />
            Manage
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Merchants"
        subtitle="Approve, suspend and manage buyer accounts."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New merchant
          </Button>
        }
      />

      <div className="mb-4 max-w-md">
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Search by name or email…"
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
      ) : data ? (
        <Card>
          <DataTable
            columns={columns}
            rows={data.content}
            rowKey={(u) => u.id}
            empty="No merchants found."
          />
          <div className="px-4">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onChange={setPage}
              pageSize={size}
              onPageSizeChange={setSize}
            />
          </div>
        </Card>
      ) : null}

      {/* Create merchant */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New merchant account"
        description="Created active — the merchant can sign in immediately."
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button form="create-merchant-form" type="submit" loading={createMerchant.isPending}>
              Create merchant
            </Button>
          </>
        }
      >
        <form id="create-merchant-form" onSubmit={submitCreate} className="space-y-4">
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

      {/* Manage account */}
      <Modal
        open={!!managing}
        onClose={() => setManaging(null)}
        title="Manage account"
        description={managing?.email}
      >
        {managing && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar name={managing.fullName} size="lg" />
              <div>
                <p className="font-semibold text-slate-800">{managing.fullName}</p>
                <p className="text-sm text-slate-400">Joined {formatDate(managing.createdAt)}</p>
              </div>
            </div>

            <Select
              label="Account status"
              value={managing.status}
              options={USER_STATUSES.map((s) => ({ value: s, label: s }))}
              onChange={(e) =>
                updateStatus.mutate(
                  { id: managing.id, status: e.target.value as UserStatus },
                  { onSuccess: () => setManaging((m) => (m ? { ...m, status: e.target.value as UserStatus } : m)) },
                )
              }
            />

            <Select
              label="Role"
              value={managing.role}
              options={[
                { value: "MERCHANT", label: "Merchant" },
                { value: "ADMIN", label: "Admin" },
              ]}
              onChange={(e) =>
                updateRole.mutate(
                  { id: managing.id, role: e.target.value as Role },
                  { onSuccess: () => setManaging((m) => (m ? { ...m, role: e.target.value as Role } : m)) },
                )
              }
            />

            <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              Changes apply immediately. Suspending an account blocks the merchant from logging in
              and transacting.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
