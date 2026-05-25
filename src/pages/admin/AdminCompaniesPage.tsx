import { useState, type FormEvent } from "react";
import { Building2, Pencil, Plus, Power } from "lucide-react";
import { useCompanies, useDeactivateCompany, useSaveCompany } from "@/hooks/useCatalog";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar } from "@/components/common/Avatar";
import {
  Button,
  Card,
  CardBody,
  CompanyStatusBadge,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Modal,
  Pagination,
  Textarea,
  type Column,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Company, CompanyRequest } from "@/types/api";

const EMPTY: CompanyRequest = {
  name: "",
  logoUrl: "",
  bankAccount: "",
  contactEmail: "",
  registrationNo: "",
  phone: "",
  address: "",
  description: "",
};

export function AdminCompaniesPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, error, refetch } = useCompanies({ page, size: 12 });
  const saveCompany = useSaveCompany();
  const deactivateCompany = useDeactivateCompany();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyRequest>(EMPTY);
  const [toDeactivate, setToDeactivate] = useState<Company | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (c: Company) => {
    setEditing(c);
    // bankAccount + registrationNo aren't on the merchant-facing list DTO; admins re-enter them.
    setForm({
      name: c.name,
      logoUrl: c.logoUrl ?? "",
      bankAccount: "",
      contactEmail: c.contactEmail ?? "",
      registrationNo: "",
      phone: c.phone ?? "",
      address: c.address ?? "",
      description: c.description ?? "",
    });
    setModalOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    saveCompany.mutate({ id: editing?.id, body: form }, { onSuccess: () => setModalOpen(false) });
  };

  const columns: Column<Company>[] = [
    {
      key: "name",
      header: "Company",
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.name} src={c.logoUrl} square />
          <div>
            <p className="font-medium text-slate-800">{c.name}</p>
            <p className="text-xs text-slate-400">{c.contactEmail ?? "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (c) => <CompanyStatusBadge status={c.status} /> },
    { key: "created", header: "Added", render: (c) => formatDate(c.createdAt) },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
            <Pencil className="h-4 w-4" />
          </Button>
          {c.status === "ACTIVE" && (
            <Button size="sm" variant="ghost" onClick={() => setToDeactivate(c)}>
              <Power className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Companies"
        subtitle="Supplier companies and their settlement bank accounts."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New company
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data && data.content.length > 0 ? (
        <Card>
          <DataTable columns={columns} rows={data.content} rowKey={(c) => c.id} />
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
          <CardBody>
            <EmptyState
              icon={Building2}
              title="No companies yet"
              description="Add your first supplier company to start listing products."
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  New company
                </Button>
              }
            />
          </CardBody>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit company" : "New company"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button form="company-form" type="submit" loading={saveCompany.isPending}>
              Save company
            </Button>
          </>
        }
      >
        <form id="company-form" onSubmit={submit} className="space-y-4">
          <Input
            label="Company name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Settlement bank account"
            required
            placeholder="e.g. ABA-000111222"
            hint={editing ? "Re-enter to confirm the settlement account." : undefined}
            value={form.bankAccount}
            onChange={(e) => setForm((f) => ({ ...f, bankAccount: e.target.value }))}
          />
          <Input
            label="Contact email"
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Business reg. no."
              placeholder="e.g. KH-123456"
              hint={editing ? "Re-enter to keep on file." : undefined}
              value={form.registrationNo}
              onChange={(e) => setForm((f) => ({ ...f, registrationNo: e.target.value }))}
            />
            <Input
              label="Company phone"
              placeholder="+855 …"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <Input
            label="Address"
            placeholder="Street, city, province"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Logo URL"
            placeholder="https://…"
            value={form.logoUrl}
            onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDeactivate}
        onClose={() => setToDeactivate(null)}
        onConfirm={() =>
          toDeactivate &&
          deactivateCompany.mutate(toDeactivate.id, { onSuccess: () => setToDeactivate(null) })
        }
        title={`Deactivate ${toDeactivate?.name ?? "company"}?`}
        message="The company and its products will no longer appear in the catalog."
        confirmLabel="Deactivate"
        loading={deactivateCompany.isPending}
      />
    </>
  );
}
