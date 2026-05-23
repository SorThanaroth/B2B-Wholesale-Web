import { Link, useNavigate } from "react-router-dom";
import { Building2, ShoppingBag, Store, Trash2 } from "lucide-react";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/useCart";
import { PageHeader } from "@/components/common/PageHeader";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export function CartPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const isEmpty = !cart || cart.totalItems === 0;

  return (
    <>
      <PageHeader
        title="Your cart"
        subtitle={isEmpty ? undefined : `${cart.totalItems} item(s) across ${cart.companies.length} supplier(s)`}
        actions={
          !isEmpty ? (
            <Button
              variant="ghost"
              onClick={() => clearCart.mutate()}
              loading={clearCart.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Clear cart
            </Button>
          ) : undefined
        }
      />

      {isEmpty ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add wholesale products from the catalog to get started."
          action={
            <Link to={ROUTES.catalog}>
              <Button>
                <Store className="h-4 w-4" />
                Browse catalog
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Items grouped by company (Section 7.1 per-company subtotals) */}
          <div className="space-y-5 lg:col-span-2">
            {cart.companies.map((group) => (
              <Card key={group.companyId}>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <Building2 className="h-4 w-4 text-accent-600" />
                    {group.companyName}
                  </div>
                  <span className="text-sm text-slate-500">
                    Subtotal {formatCurrency(group.subtotal)}
                  </span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {group.items.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={ROUTES.product(item.productId)}
                          className="font-medium text-slate-800 hover:text-brand-700"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-sm text-slate-400">
                          {formatCurrency(item.unitPrice)} / {item.unit} · min {item.minOrderQty}
                        </p>
                      </div>
                      <QuantityStepper
                        value={item.quantity}
                        min={item.minOrderQty}
                        disabled={updateItem.isPending}
                        onChange={(quantity) => updateItem.mutate({ id: item.id, quantity })}
                      />
                      <div className="w-24 text-right font-semibold text-slate-800">
                        {formatCurrency(item.subtotal)}
                      </div>
                      <button
                        onClick={() => removeItem.mutate(item.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* Order summary */}
          <div>
            <Card className="sticky top-24">
              <CardBody className="space-y-4">
                <h3 className="font-semibold text-slate-800">Order summary</h3>
                <div className="space-y-2 text-sm">
                  {cart.companies.map((g) => (
                    <div key={g.companyId} className="flex justify-between text-slate-500">
                      <span className="truncate pr-2">{g.companyName}</span>
                      <span>{formatCurrency(g.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="font-medium text-slate-700">Grand total</span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatCurrency(cart.grandTotal)}
                  </span>
                </div>
                <Button className="w-full" size="lg" onClick={() => navigate(ROUTES.checkout)}>
                  Proceed to checkout
                </Button>
                <p className="text-center text-xs text-slate-400">
                  You’ll pay all suppliers at once with a single QR code.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
