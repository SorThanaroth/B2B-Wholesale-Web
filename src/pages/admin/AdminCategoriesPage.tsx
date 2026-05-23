import { useState, type FormEvent } from "react";
import { ChevronRight, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { useCategories, useDeleteCategory, useSaveCategory } from "@/hooks/useCatalog";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Button,
  Card,
  CardBody,
  ConfirmDialog,
  EmptyState,
  Input,
  LoadingState,
  Modal,
  Select,
  Textarea,
} from "@/components/ui";
import { flattenCategoryOptions } from "@/lib/categories";
import type { Category, CategoryRequest } from "@/types/api";

const EMPTY: CategoryRequest = { name: "", description: "", parentId: null };

export function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const saveCategory = useSaveCategory();
  const deleteCategory = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryRequest>(EMPTY);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const parentOptions = categories
    ? flattenCategoryOptions(categories).filter((o) => o.value !== editing?.id)
    : [];

  const openCreate = (parentId: string | null = null) => {
    setEditing(null);
    setForm({ ...EMPTY, parentId });
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? "", parentId: c.parentId ?? null });
    setModalOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    saveCategory.mutate(
      { id: editing?.id, body: { ...form, parentId: form.parentId || null } },
      { onSuccess: () => setModalOpen(false) },
    );
  };

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Organise products into categories and sub-categories."
        actions={
          <Button onClick={() => openCreate()}>
            <Plus className="h-4 w-4" />
            New category
          </Button>
        }
      />

      <Card>
        <CardBody>
          {isLoading ? (
            <LoadingState />
          ) : categories && categories.length > 0 ? (
            <ul className="space-y-1">
              {categories.map((c) => (
                <CategoryNode
                  key={c.id}
                  node={c}
                  depth={0}
                  onEdit={openEdit}
                  onAddChild={(id) => openCreate(id)}
                  onDelete={setToDelete}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FolderTree}
              title="No categories yet"
              description="Create your first category to organise the catalog."
              action={
                <Button onClick={() => openCreate()}>
                  <Plus className="h-4 w-4" />
                  New category
                </Button>
              }
            />
          )}
        </CardBody>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit category" : "New category"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button form="category-form" type="submit" loading={saveCategory.isPending}>
              Save
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={submit} className="space-y-4">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Select
            label="Parent category"
            placeholder="None (top level)"
            options={parentOptions}
            value={form.parentId ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value || null }))}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete && deleteCategory.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }
        title={`Delete ${toDelete?.name ?? "category"}?`}
        message="Sub-categories may be affected. Products in this category will keep their reference."
        confirmLabel="Delete"
        loading={deleteCategory.isPending}
      />
    </>
  );
}

/** Recursive tree row. */
function CategoryNode({
  node,
  depth,
  onEdit,
  onAddChild,
  onDelete,
}: {
  node: Category;
  depth: number;
  onEdit: (c: Category) => void;
  onAddChild: (id: string) => void;
  onDelete: (c: Category) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  return (
    <li>
      <div
        className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50"
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
      >
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-slate-300 ${hasChildren ? "rotate-90" : "opacity-0"}`}
        />
        <FolderTree className="h-4 w-4 shrink-0 text-accent-500" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-800">{node.name}</p>
          {node.description && <p className="truncate text-xs text-slate-400">{node.description}</p>}
        </div>
        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => onAddChild(node.id)}
            className="rounded p-1.5 text-slate-400 hover:bg-white hover:text-accent-600"
            aria-label="Add sub-category"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(node)}
            className="rounded p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(node)}
            className="rounded p-1.5 text-slate-400 hover:bg-white hover:text-red-600"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {hasChildren && (
        <ul>
          {node.children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
