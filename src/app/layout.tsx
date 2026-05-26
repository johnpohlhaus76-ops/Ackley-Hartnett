import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ackleyhartnett.com"),
  title: {
    default: "Ackley Hartnett — Pharmaceutical Tablet & Capsule Marking Systems",
    template: "%s · Ackley Hartnett",
  },
  description:
    "The world leader in pharmaceutical tablet and capsule identification: edible-ink rotogravure printing, CO2 & UV laser marking, precision laser drilling and inline inspection — engineered for GMP, safety, efficacy and cleanliness.",
  keywords: [
    "pharmaceutical tablet printing",
    "capsule laser marking",
    "laser drilling osmotic tablets",
    "GMP pharmaceutical equipment",
    "tablet identification",
    "rotogravure pharmaceutical printer",
  ],
  openGraph: {
    title: "Ackley Hartnett — Pharmaceutical Marking Systems",
    description:
      "Edible-ink printing, CO2 & UV laser marking, precision laser drilling and inline inspection — engineered for GMP.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
