import type { Metadata } from "next";
import { SimplePage, SimplePageLink } from "@/components/ui/SimplePage";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your Toros Knife & Tool cart.",
};

export default function CartPage() {
  return (
    <SimplePage eyebrow="Account" title="Cart">
      <p>Your cart is empty. Site-wide cart and checkout are rolling out soon — many blades are available for direct checkout from their product pages.</p>
      <p>
        <SimplePageLink href="/shop">Continue shopping</SimplePageLink>
      </p>
    </SimplePage>
  );
}
