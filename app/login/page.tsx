import type { Metadata } from "next";
import { SimplePage, SimplePageLink } from "@/components/ui/SimplePage";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Toros Knife & Tool account.",
};

export default function LoginPage() {
  return (
    <SimplePage eyebrow="Account" title="Login">
      <p>Account sign-in is coming soon. You can browse the full collection and checkout on individual product pages today.</p>
      <p>
        <SimplePageLink href="/shop">Browse the shop</SimplePageLink>
        {" · "}
        <SimplePageLink href="/register">Create an account</SimplePageLink>
      </p>
    </SimplePage>
  );
}
