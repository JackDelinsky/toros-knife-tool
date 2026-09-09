import type { Metadata } from "next";
import { SimplePage, SimplePageLink } from "@/components/ui/SimplePage";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Toros Knife & Tool account.",
};

export default function RegisterPage() {
  return (
    <SimplePage eyebrow="Account" title="Create an account">
      <p className="t-body">
        Registration will let you track orders and save builds in one place. It is not built
        yet, so this page collects nothing. If you want to be told when it opens, the
        newsletter on the homepage is the place.
      </p>
      <p className="t-body">
        <SimplePageLink href="/shop">Browse the shop</SimplePageLink>
        {" · "}
        <SimplePageLink href="/contact">Ask us something</SimplePageLink>
      </p>
    </SimplePage>
  );
}
