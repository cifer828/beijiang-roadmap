import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:43127"),
  title: "北疆秋日环线 · 十一天自驾助手",
  description: "一车 · 两家 · 四人 · 十一天。2026 北疆秋日环线每日行程、导航、清单与双家庭记账。",
  icons: { icon: "/images/share/og.png" },
  openGraph: {
    title: "北疆秋日环线 · 十一天自驾助手",
    description: "一车 · 两家 · 四人 · 十一天。北疆自驾行程随身助手。",
    images: [{ url: "/images/share/og.png", width: 1731, height: 909, alt: "北疆秋日环线" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#173b30",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" className={GeistSans.className}><body>{children}</body></html>;
}
