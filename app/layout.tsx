import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Crown Care | Premium Upholstery Cleaning",
    template: "%s | Crown Care",
  },
  description:
    "Crown Care delivers premium upholstery cleaning services across the US. Restore your furniture to its original glory with expert, eco-friendly solutions.",
  keywords: [
    "upholstery cleaning",
    "sofa cleaning",
    "furniture cleaning",
    "premium cleaning service",
    "couch cleaning",
    "Crown Care",
  ],
  authors:  [{ name: "Crown Care" }],
  creator:  "Crown Care",
  openGraph: {
    type:        "website",
    locale:      "en_US",
    title:       "Crown Care | Premium Upholstery Cleaning",
    description: "Restore your furniture to its original glory with Crown Care.",
    siteName:    "Crown Care",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Crown Care | Premium Upholstery Cleaning",
    description: "Restore your furniture to its original glory with Crown Care.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
