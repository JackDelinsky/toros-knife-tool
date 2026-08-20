import type { Metadata } from "next";
import { AboutUsContent } from "@/components/about/AboutUsContent";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The Turkish-American story behind Toros Knife & Tool, founded by father-son duo Murat and Aydin.",
};

export default function AboutPage() {
  return <AboutUsContent />;
}
