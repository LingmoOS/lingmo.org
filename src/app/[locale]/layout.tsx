import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { MainLayout } from "@/components/layout/MainLayout";

/**
 * 预生成四个语言的页面（Next.js App Router 的 `generateStaticParams` 约定：
 * 返回 `[{ locale: "en" }, ...]`）。
 *
 * 这是本次「全站 404」修复的关键：没有它，`[locale]` 只能走请求期渲染，
 * 而请求期渲染在当前的 Next.js 15.x + `@cloudflare/next-on-pages` 组合下
 * 不会进入 worker 的路由表，表现为所有页面都返回 Next 自带的 404。
 * 有了它，全部页面在 `next build` 阶段就被预渲染为静态 HTML，
 * 由 Cloudflare Pages 的静态资源层直接返回，不再依赖边缘函数运行时。
 *
 * 关于 `runtime = "edge"`：此处已移除。`@cloudflare/next-on-pages` 要求
 * 服务端渲染的路由必须使用 Edge Runtime，但 Next.js 15.2 起已不再支持
 * 通过该适配器在 Cloudflare Pages 上使用 Edge Runtime
 * （见 cloudflare/next-on-pages#952、#954），因此改为完全静态预渲染，
 * 从根上摆脱对边缘函数运行时的依赖。
 */

/** 预生成的 locale 参数列表 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * 只允许上面预生成的语言，其余路径直接交给 Next 的 404，
 * 避免在请求期回落到（当前不可用的）边缘运行时渲染。
 */
export const dynamicParams = false;

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
