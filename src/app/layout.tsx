import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/layout/CartDrawer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Syö & Juo — Exceptional Taste",
  description:
    "Exceptional dining. Delivered. A Michelin-caliber restaurant in Helsinki offering an exclusive at-home dining experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} h-full`}>
      <body className="min-h-full flex flex-col relative font-sans">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <CartDrawer />
      </body>
    </html>
  );
}
