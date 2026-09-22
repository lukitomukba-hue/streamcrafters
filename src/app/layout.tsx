import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StreamCrafters VIP",
  description: "Luxury AI Cinema Experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ka">
      <body className="bg-[#08080a] text-amber-100 antialiased selection:bg-amber-500 selection:text-black">{children}</body>
    </html>
  );
}