import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnimatedTitle from "@/components/AnimatedTitle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AnonLink",
  description: "Simple URL shortener with no tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AnimatedTitle />
        {children}
      </body>
    </html>
  );
}