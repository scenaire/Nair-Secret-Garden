import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";

// ฟอนต์หัวข้อ (หรูหรา โรแมนติก)
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
});

// ฟอนต์เนื้อหา (อ่านง่าย สบายตา)
const notoSerif = Noto_Serif_Thai({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "The Secret Garden",
  description: "A Spring Guestbook for Nair",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${cormorant.variable} ${notoSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}