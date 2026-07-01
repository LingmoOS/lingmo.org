import type { Metadata } from "next";
import { Inter } from "next/font/google";
export const runtime = "edge";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Lingmo OS — Elegant. Fast. Open.",
    template: "%s | Lingmo OS",
  },
  description: "Lingmo OS is an elegant, fast, and open-source operating system designed for everyone.",
  keywords: ["Lingmo OS", "operating system", "Linux", "open source", "desktop"],
  authors: [{ name: "Lingmo Project" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://lingmo.org"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Lingmo OS",
    title: "Lingmo OS — Elegant. Fast. Open.",
    description: "An elegant, fast, and open-source operating system designed for everyone.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lingmo OS — Elegant. Fast. Open.",
    description: "An elegant, fast, and open-source operating system designed for everyone.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <MainLayout>{children}</MainLayout>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
