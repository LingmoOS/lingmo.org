export const runtime = "edge";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { MainLayout } from "@/components/layout/MainLayout";

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <MainLayout>{children}</MainLayout>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
