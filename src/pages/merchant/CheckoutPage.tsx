import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, QrCode, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useOrders";
import { useAddresses } from "@/hooks/useProfile";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  LoadingState,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const { data: addresses } = useAddresses();
  const checkout = useCheckout();

  // If the cart empties out (e.g. after a prior checkout), bounce back.
  useEffect(() => {
    if (!isLoading && cart && cart.totalItems === 0 && !checkout.isPending && !checkout.isSuccess) {
      navigate(ROUTES.cart, { replace: true });
    }
  }, [isLoading, cart, checkout.isPending, checkout.isSuccess, navigate]);

  if (isLoading) return <LoadingState />;
  if (!cart || cart.totalItems === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nothing to check out"
        description="Add items to your cart first."
        action={
          <Link to={ROUTES.catalog}>
            <Button>Browse catalog</Button>
          </Link>
        }
      />
    );
  }

  const defaultAddress = addresses?.find((a) => a.isDefault) ?? addresses?.[0];

  const placeOrder = () =>
    checkout.mutate(undefined, {
      onSuccess: (qr) => navigate(ROUTES.payment(qr.orderId)),
    });

  return (
    <>
      <Link
        to={ROUTES.cart}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cart
      </Link>
      <PageHeader title="Checkout" subtitle="Review your order before generating a payment QR." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Delivery address */}
          <Card>
            <CardHeader
              title="Delivery address"
              action={
                <Link
                  to={ROUTES.profile}
                  className="text-sm font-medium text-accent-600 hover:text-accent-700"
                >
                  Manage
                </Link>
              }
            />
            <CardBody>
              {defaultAddress ? (
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div className="text-sm">
                    {defaultAddress.label && (
                      <p className="font-medium text-slate-800">{defaultAddress.label}</p>
                    )}
                    <p className="text-slate-600">{defaultAddress.street}</p>
                    <p className="text-slate-500">
                      {[defaultAddress.city, defaultAddress.province].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No delivery address on file.{" "}
                  <Link to={ROUTES.profile} className="font-medium text-accent-600">
                    Add one
                  </Link>{" "}
                  so suppliers know where to ship.
                </p>
              )}
            </CardBody>
          </Card>

          {/* Items by company */}
          <Card>
            <CardHeader title="Order items" description={`${cart.totalItems} item(s)`} />
            <div className="divide-y divide-slate-100">
              {cart.companies.map((group) => (
                <div key={group.companyId} className="px-5 py-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">{group.companyName}</p>
                    <p className="text-sm text-slate-500">{formatCurrency(group.subtotal)}</p>
                  </div>
                  <ul className="space-y-1 text-sm text-slate-500">
                    {group.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          {item.productName}{" "}
                          <span className="text-slate-400">
                            × {item.quantity} {item.unit}
                          </span>
                        </span>
                        <span>{formatCurrency(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Payment summary */}
        <div>
          <Card className="sticky top-24">
            <CardBody className="space-y-4">
              <h3 className="font-semibold text-slate-800">Payment</h3>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="font-medium text-slate-700">Total to pay</span>
                <span className="text-2xl font-bold text-slate-900">
                  {formatCurrency(cart.grandTotal)}
                </span>
              </div>
              <div className="rounded-lg bg-accent-50 p-3 text-sm text-accent-800">
                One QR pays all {cart.companies.length} supplier(s). We split and settle each
                company’s share automatically.
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={placeOrder}
                loading={checkout.isPending}
              >
                <QrCode className="h-5 w-5" />
                Place order & generate QR
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
