import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Boxes, ImageOff, Layers, ShoppingCart, Tag } from "lucide-react";
import { useProduct } from "@/hooks/useCatalog";
import { useAddToCart } from "@/hooks/useCart";
import { PageHeader } from "@/components/common/PageHeader";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { Badge, Button, ErrorState, LoadingState } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) setQty(product.minOrderQty);
  }, [product]);

  if (isLoading) return <LoadingState />;
  if (isError || !product) return <ErrorState error={error} onRetry={refetch} />;

  const outOfStock = product.stock <= 0;

  return (
    <>
      <Link
        to={ROUTES.catalog}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to catalog
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex aspect-square items-center justify-center bg-slate-100">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <ImageOff className="h-16 w-16 text-slate-300" />
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-semibold text-accent-600">{product.companyName}</p>
          <PageHeader title={product.name} />

          <div className="-mt-4 flex flex-wrap gap-2">
            {product.categoryName && (
              <Badge tone="neutral">
                <Tag className="h-3 w-3" />
                {product.categoryName}
              </Badge>
            )}
            <Badge tone={outOfStock ? "danger" : "success"}>
              <Boxes className="h-3 w-3" />
              {outOfStock ? "Out of stock" : `${product.stock} ${product.unit} in stock`}
            </Badge>
            <Badge tone="info">
              <Layers className="h-3 w-3" />
              Min order {product.minOrderQty} {product.unit}
            </Badge>
          </div>

          <p className="mt-6 text-3xl font-bold text-slate-900">
            {formatCurrency(product.price)}
            <span className="ml-1 text-base font-normal text-slate-400">/ {product.unit}</span>
          </p>

          {product.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          )}

          <div className="mt-auto pt-8">
            <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="label">Quantity ({product.unit})</p>
                <QuantityStepper
                  value={qty}
                  onChange={setQty}
                  min={product.minOrderQty}
                  max={product.stock || undefined}
                  disabled={outOfStock}
                />
                <p className="mt-1 text-xs text-slate-400">
                  Wholesale minimum: {product.minOrderQty} {product.unit}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-400">Subtotal</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(product.price * qty)}
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="mt-4 w-full"
              disabled={outOfStock}
              loading={addToCart.isPending}
              onClick={() => addToCart.mutate({ productId: product.id, quantity: qty })}
            >
              <ShoppingCart className="h-5 w-5" />
              Add to cart
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
