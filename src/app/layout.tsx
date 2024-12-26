import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnimatedTitle from "@/components/AnimatedTitle";
import Footer from "@/components/layout/Footer";
import GridPattern from "@/components/ui/grid-pattern";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AnonLink",
  description: "Simple URL shortener with no tracking",
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: {
      url: "https://r2.e-z.host/ca19848c-de8c-4cae-9a10-858d6fd864b7/bs87qcee.png",
      type: "image/png",
    },
  },
  openGraph: {
    title: "AnonLink",
    description: "Simple URL shortener with no tracking",
    images: [
      {
        url: "https://r2.e-z.host/ca19848c-de8c-4cae-9a10-858d6fd864b7/bs87qcee.png",
        width: 1200,
        height: 630,
        alt: "AnonLink - Simple URL shortener",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AnonLink",
    description: "Simple URL shortener with no tracking",
    images: [
      "https://r2.e-z.host/ca19848c-de8c-4cae-9a10-858d6fd864b7/bs87qcee.png",
    ],
  },
  metadataBase: new URL("https://anon.love"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
    >
      <body className={`${inter.className} relative`}>
        <div className="fixed inset-0 -z-10 opacity-30">
          <GridPattern />
        </div>
        <AnimatedTitle />
        {children}
        <Footer />
      </body>
    </html>
  );
}
