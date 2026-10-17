export const runtime = "edge";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { MainLayout } from "@/components/layout/MainLayout";

/**
 * 本段之下有两类路由：
 * - 构建期就能枚举的静态页面（`/zh-CN`、`/zh-CN/status` 等），由下面的
 *   `generateStaticParams()` 在 `next build` 阶段预渲染成 HTML；
 * - 只能请求期渲染的动态段（`/blog/[slug]`、`/releases/[version]`），它们的页面
 *   文件首行是 `"use client"`，不能再导出 `generateStaticParams()`，因此留在请求期。
 *
 * `runtime = "edge"` 是请求期渲染的前提：当前部署是 Cloudflare Pages +
 * `@cloudflare/next-on-pages`，该适配器只把声明了 Edge Runtime 的路由打进
 * `_worker.js`；缺少这条声明时，请求期渲染的路由要么在构建期被适配器拒绝
 * （要求 Edge Runtime），要么在运行时直接 500。
 *
 * 两者可以共存：静态页面照旧预渲染成静态资源，动态段交给边缘函数。
 */

/** 预生成的 locale 参数列表，对应 `routing.locales` 里的四个语言 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 关键：把 locale 写进请求级缓存，使本布局及其子页走静态渲染。
  // 这是 next-intl 官方推荐的静态渲染写法，缺少它时 getLocale()/getMessages()
  // 会退化为依赖请求头的动态渲染。
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
