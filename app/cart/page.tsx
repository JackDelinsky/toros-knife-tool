import type { Metadata } from "next";
import { SimplePage, SimplePageLink } from "@/components/ui/SimplePage";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your Toros Knife & Tool cart.",
};

export default function CartPage() {
  return (
    <SimplePage eyebrow="Account" title="Your cart is empty">
      <p className="t-body">
        This is a demo storefront. Adding a knife from the homepage keeps it in your browser
        only — nothing is reserved and no payment is taken. A site-wide cart and checkout are
        still to come; several blades link straight to a real checkout from their own pages.
      </p>
      <p className="t-body">
        <SimplePageLink href="/shop">Keep browsing the shop</SimplePageLink>
      </p>
    </SimplePage>
  );
}
