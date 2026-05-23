import { Link } from "react-router-dom";
import { ImageOff, Package, Plus } from "lucide-react";
import type { Product } from "@/types/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants/routes";

/** Catalog grid tile. The "Add" button quick-adds at the product's minimum qty. */
export function ProductCard({
  product,
  onQuickAdd,
  adding,
}: {
  product: Product;
  onQuickAdd?: (product: Product) => void;
  adding?: boolean;
}) {
  const outOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition hover:shadow-md">
      <Link to={ROUTES.product(product.id)} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageOff className="h-10 w-10" />
          </span>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-accent-600">{product.companyName}</p>
        <Link
          to={ROUTES.product(product.id)}
          className="mt-1 line-clamp-2 font-medium text-slate-800 hover:text-brand-700"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <Package className="h-3.5 w-3.5" />
          <span>
            Min {product.minOrderQty} {product.unit} · {product.stock} in stock
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(product.price)}</p>
            <p className="text-xs text-slate-400">per {product.unit}</p>
          </div>
          {onQuickAdd && (
            <Button
              size="sm"
              variant="secondary"
              disabled={outOfStock}
              loading={adding}
              onClick={() => onQuickAdd(product)}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
