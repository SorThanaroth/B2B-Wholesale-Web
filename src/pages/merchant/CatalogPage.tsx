import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useProducts, useCategories, useCompanies } from "@/hooks/useCatalog";
import { useAddToCart } from "@/hooks/useCart";
import { useDebounce } from "@/hooks/useDebounce";
import { PageHeader } from "@/components/common/PageHeader";
import { ProductCard } from "@/components/common/ProductCard";
import {
  Button,
  Input,
  Select,
  Pagination,
  EmptyState,
  ErrorState,
  LoadingState,
  type SelectOption,
} from "@/components/ui";
import { flattenCategoryOptions } from "@/lib/categories";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import type { Product } from "@/types/api";

export function CatalogPage() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const search = useDebounce(searchInput, 400);

  const query = useMemo(
    () => ({
      page,
      size: DEFAULT_PAGE_SIZE,
      search: search || undefined,
      company: company || undefined,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }),
    [page, search, company, category, minPrice, maxPrice],
  );

  const { data, isLoading, isError, error, refetch } = useProducts(query);
  const { data: companies } = useCompanies({ size: 100 });
  const { data: categories } = useCategories();
  const addToCart = useAddToCart();

  const companyOptions: SelectOption[] =
    companies?.content.map((c) => ({ value: c.id, label: c.name })) ?? [];
  const categoryOptions = categories ? flattenCategoryOptions(categories) : [];

  const resetFilters = () => {
    setCompany("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSearchInput("");
    setPage(0);
  };

  const hasFilters = !!(company || category || minPrice || maxPrice || searchInput);

  const handleQuickAdd = (product: Product) =>
    addToCart.mutate({ productId: product.id, quantity: product.minOrderQty });

  return (
    <>
      <PageHeader
        title="Product catalog"
        subtitle="Browse wholesale products from every supplier on the platform."
      />

      {/* Search + filter bar */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search products, descriptions, suppliers…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(0);
            }}
          />
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)} className="shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid animate-fade-in grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-5">
            <Select
              label="Supplier"
              placeholder="All suppliers"
              options={companyOptions}
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                setPage(0);
              }}
            />
            <Select
              label="Category"
              placeholder="All categories"
              options={categoryOptions}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
              }}
            />
            <Input
              label="Min price"
              type="number"
              min={0}
              placeholder="0"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(0);
              }}
            />
            <Input
              label="Max price"
              type="number"
              min={0}
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(0);
              }}
            />
            <div className="flex items-end">
              <Button variant="ghost" onClick={resetFilters} disabled={!hasFilters} className="w-full">
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data && data.content.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.content.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickAdd={handleQuickAdd}
                adding={addToCart.isPending && addToCart.variables?.productId === product.id}
              />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            onChange={setPage}
          />
        </>
      ) : (
        <EmptyState
          title="No products found"
          description={
            hasFilters
              ? "Try widening your filters or clearing the search."
              : "There are no products in the catalog yet."
          }
          action={
            hasFilters ? (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}
    </>
  );
}
