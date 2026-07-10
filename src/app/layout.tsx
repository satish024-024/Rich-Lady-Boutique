import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";
import { MotionProvider } from "@/providers/MotionProvider";
import { FutureToastProvider } from "@/providers/FutureToastProvider";
import { AuthProvider } from "@/providers/AuthProvider";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rich Lady Boutique | Premium Women's Fashion since 2011",
  description: "Since 2011, Rich Lady Boutique curates premium quality women's fashion at affordable prices. Explore our exclusive collection of Sarees, Kurtis, Dress Materials, Lehengas, and Accessories. Serving both wholesale and retail clients globally.",
  keywords: "Rich Lady Boutique, Rich Lady, Rajahmundry boutique, premium sarees, designer kurtis, lehengas, wholesale dress materials, Indian luxury boutique",
  authors: [{ name: "Rich Lady Boutique" }],
  openGraph: {
    title: "Rich Lady Boutique | Premium Women's Fashion",
    description: "Curated premium fashion since 2011. Explore sarees, kurtis, and designer wear with worldwide shipping.",
    url: "https://richladyboutique.com",
    siteName: "Rich Lady Boutique",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/hero-fallback.jpg",
        width: 1200,
        height: 630,
        alt: "Rich Lady Boutique Premium Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rich Lady Boutique | Premium Women's Fashion",
    description: "Curated premium fashion since 2011. Explore sarees, kurtis, and designer wear with worldwide shipping.",
    images: ["/images/hero-fallback.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${inter.variable} h-full antialiased selection-gold`}
    >
      <body className="min-h-full flex flex-col bg-primary-bg text-primary-text">
        <ThemeProvider>
          <SmoothScrollProvider>
            <MotionProvider>
              <FutureToastProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </FutureToastProvider>
            </MotionProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

