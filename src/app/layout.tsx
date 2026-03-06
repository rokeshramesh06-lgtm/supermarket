import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Verdura Market",
  description:
    "A modern mobile-friendly supermarket experience built with Next.js and SQLite.",
};

export const runtime = "nodejs";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className={`${manrope.variable} ${cormorant.variable} antialiased`}>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header user={user} />
            <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
