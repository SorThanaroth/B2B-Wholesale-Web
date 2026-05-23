import { useMemo, useRef, useState, type FormEvent } from "react";
import { Pencil, Plus, Power, Search, Upload } from "lucide-react";
import {
  useCategories,
  useCompanies,
  useDeactivateProduct,
  useImportProducts,
  useProducts,
  useSaveProduct,
} from "@/hooks/useCatalog";
import { useDebounce } from "@/hooks/useDebounce";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  ErrorState,
  Input,
  LoadingState,
  Modal,
  Pagination,
  Select,
  Textarea,
  type Column,
  type SelectOption,
} from "@/components/ui";
import { flattenCategoryOptions } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";
import type { Product, ProductRequest } from "@/types/api";

const EMPTY: ProductRequest = {
  companyId: "",
  categoryId: "",
  name: "",
  description: "",
  price: 0,
  minOrderQty: 1,
  unit: "",
  stock: 0,
  imageUrl: "",
};

export function AdminProductsPage() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const search = useDebounce(searchInput, 400);

  const query = useMemo(
    () => ({ page, size: 12, search: search || undefined, company: companyFilter || undefined }),
    [page, search, companyFilter],
  );

  const { data, isLoading, isError, error, refetch } = useProducts(query);
  const { data: companies } = useCompanies({ size: 100 });
  const { data: categories } = useCategories();
  const saveProduct = useSaveProduct();
  const deactivateProduct = useDeactivateProduct();
  const importProducts = useImportProducts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductRequest>(EMPTY);
  const [toDeactivate, setToDeactivate] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importCompany, setImportCompany] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const companyOptions: SelectOption[] =
    companies?.content.map((c) => ({ value: c.id, label: c.name })) ?? [];
  const categoryOptions = categories ? flattenCategoryOptions(categories) : [];

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, companyId: companyOptions[0]?.value ?? "" });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      companyId: p.companyId,
      categoryId: p.categoryId ?? "",
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      minOrderQty: p.minOrderQty,
      unit: p.unit,
      stock: p.stock,
      imageUrl: p.imageUrl ?? "",
    });
    setModalOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body: ProductRequest = { ...form, categoryId: form.categoryId || null };
    saveProduct.mutate({ id: editing?.id, body }, { onSuccess: () => setModalOpen(false) });
  };

  const runImport = () => {
    const file = fileRef.current?.files?.[0];
    if (!importCompany || !file) return;
    importProducts.mutate(
      { companyId: importCompany, file },
      {
        onSuccess: () => {
          setImportOpen(false);
          if (fileRef.current) fileRef.current.value = "";
        },
      },
    );
  };

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      render: (p) => (
        <div>
          <p className="font-medium text-slate-800">{p.name}</p>
          <p className="text-xs text-slate-400">
            {p.companyName}
            {p.categoryName ? ` · ${p.categoryName}` : ""}
          </p>
        </div>
      ),
    },
    { key: "price", header: "Price", align: "right", render: (p) => formatCurrency(p.price) },
    {
      key: "min",
      header: "Min qty",
      align: "center",
      render: (p) => `${p.minOrderQty} ${p.unit}`,
    },
    {
      key: "stock",
      header: "Stock",
      align: "center",
      render: (p) => (
        <span className={p.stock <= 0 ? "text-red-600" : "text-slate-700"}>{p.stock}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge tone={p.status === "ACTIVE" ? "success" : "neutral"}>
          {p.status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
            <Pencil className="h-4 w-4" />
          </Button>
          {p.status === "ACTIVE" && (
            <Button size="sm" variant="ghost" onClick={() => setToDeactivate(p)}>
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
        title="Products"
        subtitle="Full catalog management across all supplier companies."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={openCreate} disabled={companyOptions.length === 0}>
              <Plus className="h-4 w-4" />
              New product
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Search products…"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(0);
          }}
        />
        <Select
          className="sm:w-64"
          placeholder="All suppliers"
          options={companyOptions}
          value={companyFilter}
          onChange={(e) => {
            setCompanyFilter(e.target.value);
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
            rowKey={(p) => p.id}
            empty="No products match your filters."
          />
          <div className="px-4">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onChange={setPage}
            />
          </div>
        </Card>
      ) : null}

      {/* Create / edit product */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
        title={editing ? "Edit product" : "New product"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button form="product-form" type="submit" loading={saveProduct.isPending}>
              Save product
            </Button>
          </>
        }
      >
        <form id="product-form" onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Supplier company"
              required
              placeholder="Select company"
              options={companyOptions}
              value={form.companyId}
              onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))}
            />
            <Select
              label="Category"
              placeholder="None"
              options={categoryOptions}
              value={form.categoryId ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            />
          </div>
          <Input
            label="Product name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              min={0}
              required
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            />
            <Input
              label="Unit"
              required
              placeholder="carton"
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            />
            <Input
              label="Min order qty"
              type="number"
              min={1}
              required
              value={form.minOrderQty}
              onChange={(e) => setForm((f) => ({ ...f, minOrderQty: Number(e.target.value) }))}
            />
            <Input
              label="Stock"
              type="number"
              min={0}
              required
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
            />
          </div>
          <Input
            label="Image URL"
            placeholder="https://…"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          />
        </form>
      </Modal>

      {/* CSV import */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Bulk import products"
        description="Upload a CSV of products for one supplier company."
        footer={
          <>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={runImport} loading={importProducts.isPending}>
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Supplier company"
            placeholder="Select company"
            options={companyOptions}
            value={importCompany}
            onChange={(e) => setImportCompany(e.target.value)}
          />
          <div>
            <label className="label">CSV file</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-800"
            />
          </div>
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Expected columns: <code>name, description, price, minOrderQty, unit, stock, categoryId, imageUrl</code>
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDeactivate}
        onClose={() => setToDeactivate(null)}
        onConfirm={() =>
          toDeactivate &&
          deactivateProduct.mutate(toDeactivate.id, { onSuccess: () => setToDeactivate(null) })
        }
        title={`Deactivate ${toDeactivate?.name ?? "product"}?`}
        message="It will be hidden from the catalog (soft delete) but kept for order history."
        confirmLabel="Deactivate"
        loading={deactivateProduct.isPending}
      />
    </>
  );
}
