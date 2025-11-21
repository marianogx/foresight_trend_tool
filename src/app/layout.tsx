import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

const neueHaas = localFont({
  src: [
    {
      path: '../fonts/NHaasGroteskTXPro-55Rg.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/NHaasGroteskTXPro-56It.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/NHaasGroteskTXPro-65Md.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/NHaasGroteskTXPro-66MdIt.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../fonts/NHaasGroteskTXPro-75Bd.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/NHaasGroteskTXPro-76BdIt.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-neue-haas',
});

export const metadata: Metadata = {
  title: "Señales",
  description: "Foresight & Trend Analysis Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${neueHaas.variable} font-sans bg-background text-foreground antialiased`}>
        <Navbar />
        <main className="min-h-screen bg-background">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
