import { useEffect, useState, type FormEvent } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  useAddresses,
  useChangePassword,
  useDeleteAddress,
  useProfile,
  useSaveAddress,
  useUpdateProfile,
} from "@/hooks/useProfile";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  Input,
  LoadingState,
  Modal,
} from "@/components/ui";
import type { Address, AddressRequest } from "@/types/api";

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  if (isLoading || !profile) return <LoadingState />;

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ fullName, phone: phone || undefined });
  };

  const submitPassword = (e: FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    if (pwd.next !== pwd.confirm) {
      setPwdError("New passwords do not match");
      return;
    }
    changePassword.mutate(
      { currentPassword: pwd.current, newPassword: pwd.next },
      { onSuccess: () => setPwd({ current: "", next: "", confirm: "" }) },
    );
  };

  return (
    <>
      <PageHeader title="Profile & settings" subtitle="Manage your account, password and addresses." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile info */}
        <Card>
          <CardHeader title="Account details" description={profile.email} />
          <CardBody>
            <form onSubmit={saveProfile} className="space-y-4">
              <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+855 …" />
              <div className="flex items-center gap-2 text-sm text-slate-500">
                Email verification:
                <Badge tone={profile.emailVerified ? "success" : "warning"}>
                  {profile.emailVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
              <Button type="submit" loading={updateProfile.isPending}>
                Save changes
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader title="Change password" description="Use at least 8 characters." />
          <CardBody>
            <form onSubmit={submitPassword} className="space-y-4">
              {pwdError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {pwdError}
                </div>
              )}
              <Input
                label="Current password"
                type="password"
                value={pwd.current}
                onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                required
              />
              <Input
                label="New password"
                type="password"
                minLength={8}
                value={pwd.next}
                onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                required
              />
              <Input
                label="Confirm new password"
                type="password"
                minLength={8}
                value={pwd.confirm}
                onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                required
              />
              <Button type="submit" loading={changePassword.isPending}>
                Update password
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <AddressesSection />
      </div>
    </>
  );
}

/* --------------------------- Delivery addresses --------------------------- */

const EMPTY_ADDRESS: AddressRequest = {
  label: "",
  street: "",
  city: "",
  province: "",
  isDefault: false,
};

function AddressesSection() {
  const { data: addresses, isLoading } = useAddresses();
  const saveAddress = useSaveAddress();
  const deleteAddress = useDeleteAddress();

  const [editing, setEditing] = useState<Address | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AddressRequest>(EMPTY_ADDRESS);
  const [toDelete, setToDelete] = useState<Address | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_ADDRESS);
    setModalOpen(true);
  };

  const openEdit = (a: Address) => {
    setEditing(a);
    setForm({
      label: a.label ?? "",
      street: a.street,
      city: a.city,
      province: a.province ?? "",
      isDefault: a.isDefault,
    });
    setModalOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    saveAddress.mutate(
      { id: editing?.id, body: form },
      { onSuccess: () => setModalOpen(false) },
    );
  };

  return (
    <Card>
      <CardHeader
        title="Delivery addresses"
        description="Where suppliers ship your wholesale orders."
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add address
          </Button>
        }
      />
      <CardBody>
        {isLoading ? (
          <LoadingState />
        ) : addresses && addresses.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div className="text-sm">
                    <p className="flex items-center gap-1.5 font-medium text-slate-800">
                      {a.label || "Address"}
                      {a.isDefault && (
                        <Badge tone="info">
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </p>
                    <p className="text-slate-600">{a.street}</p>
                    <p className="text-slate-500">{[a.city, a.province].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(a)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Edit address"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setToDelete(a)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-slate-400">No addresses saved yet.</p>
        )}
      </CardBody>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit address" : "Add address"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button form="address-form" type="submit" loading={saveAddress.isPending}>
              Save
            </Button>
          </>
        }
      >
        <form id="address-form" onSubmit={submit} className="space-y-4">
          <Input
            label="Label"
            placeholder="e.g. Main warehouse"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          />
          <Input
            label="Street"
            required
            value={form.street}
            onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              required
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            <Input
              label="Province"
              value={form.province}
              onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500"
            />
            Set as default delivery address
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          deleteAddress.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }
        title="Delete address?"
        message="This delivery address will be permanently removed."
        confirmLabel="Delete"
        loading={deleteAddress.isPending}
      />
    </Card>
  );
}
