import type { Metadata } from "next";
import { SimplePage, SimplePageLink } from "@/components/ui/SimplePage";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Toros Knife & Tool account.",
};

export default function LoginPage() {
  return (
    <SimplePage eyebrow="Account" title="Sign in">
      <p className="t-body">
        Accounts are not open yet — there is no sign-in behind this page, so nothing here asks
        for a password it could not check. The full collection is available to browse now.
      </p>
      <p className="t-body">
        <SimplePageLink href="/shop">Browse the shop</SimplePageLink>
        {" · "}
        <SimplePageLink href="/contact">Ask us something</SimplePageLink>
      </p>
    </SimplePage>
  );
}
