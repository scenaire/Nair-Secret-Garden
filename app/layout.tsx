import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Serif_Thai, Noto_Sans_Thai } from "next/font/google";
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

const notoSans = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500"],
  variable: "--font-noto-sans-thai",
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
    <html lang="th" className={`${cormorant.variable} ${notoSans.variable}  ${notoSerif.variable} `}>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}