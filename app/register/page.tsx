import type { Metadata } from "next";
import { SimplePage, SimplePageLink } from "@/components/ui/SimplePage";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a Toros Knife & Tool account.",
};

export default function RegisterPage() {
  return (
    <SimplePage eyebrow="Account" title="Register">
      <p>
        Registration will let you track orders, save builds, and manage your cart in one place. We&apos;re
        putting the finishing touches on it now.
      </p>
      <p>
        <SimplePageLink href="/shop">Shop knives</SimplePageLink>
        {" · "}
        <SimplePageLink href="/login">Sign in</SimplePageLink>
      </p>
    </SimplePage>
  );
}
