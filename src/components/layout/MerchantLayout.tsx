import { DashboardLayout } from "./DashboardLayout";
import { CartButton } from "./CartButton";
import { MERCHANT_NAV } from "./navigation";

export function MerchantLayout() {
  return <DashboardLayout nav={MERCHANT_NAV} topbarRight={<CartButton />} />;
}
