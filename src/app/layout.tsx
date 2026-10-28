import type { Metadata, Viewport } from "next";
import { Alexandria, Geist } from "next/font/google";
import "./globals.css";

const alexandria = Alexandria({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-latin",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fiperacademy.com"),
  title: {
    default: "Fiper Academy | دورات الأسواق المالية",
    template: "%s | Fiper Academy",
  },
  description:
    "دورات مباشرة وعملية لفهم الأسواق المالية وبناء منهج تداول أكثر وضوحاً وانضباطاً.",
  icons: {
    icon: [{ url: "/brand/fiper-mark.png", type: "image/png", sizes: "128x128" }],
    shortcut: "/brand/fiper-mark.png",
    apple: "/brand/fiper-mark.png",
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Fiper Academy",
    description: "تعلم الأسواق المالية بخطوات عملية وواضحة.",
    locale: "ar_MA",
    type: "website",
    url: "/",
    siteName: "Fiper Academy",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Fiper Academy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiper Academy",
    description: "دورات مباشرة وعملية لفهم الأسواق المالية.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#031a2d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${alexandria.variable} ${geist.variable}`}>
      <body>{children}</body>
    </html>
  );
}
