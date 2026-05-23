import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCartCount } from "@/hooks/useCart";
import { ROUTES } from "@/constants/routes";

/** Topbar cart shortcut with a live item-count badge. */
export function CartButton() {
  const count = useCartCount();
  return (
    <Link
      to={ROUTES.cart}
      className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand-700"
      aria-label={`Cart, ${count} item(s)`}
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
