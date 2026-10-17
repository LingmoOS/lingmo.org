export const runtime = "edge";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { MainLayout } from "@/components/layout/MainLayout";

/**
 * 该布局及其下所有页面走请求期渲染（edge）。
 *
 * 不要在此布局上加 `generateStaticParams()`：Next.js 不允许同一条路由同时
 * 声明 `runtime = "edge"` 与静态预渲染参数，且父布局的 edge 声明会继承给
 * 整棵子路由树，二者互斥。一旦同时出现，`next build` 直接失败：
 *
 *   Page "/[locale]/blog/page" cannot use both `export const runtime = 'edge'`
 *   and export `generateStaticParams`.
 *
 * 本段的动态详情页（`/blog/[slug]`、`/releases/[version]`）首行是 `"use client"`，
 * 本来也不能导出 `generateStaticParams()`，只能请求期渲染。
 *
 * `runtime = "edge"` 是请求期渲染的前提：当前部署是 Cloudflare Pages +
 * `@cloudflare/next-on-pages`，适配器只把声明了 Edge Runtime 的路由打进
 * `_worker.js`；缺少这条声明时，请求期渲染的路由要么在构建期被适配器拒绝
 * （要求 Edge Runtime），要么在运行时直接 500。
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 把 locale 写进请求级缓存，保证本布局及其子页在本次请求内读到正确语言。
  setRequestLocale(locale);

  const currentLocale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={currentLocale} messages={messages}>
      <ThemeProvider>
        <MainLayout>{children}</MainLayout>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
