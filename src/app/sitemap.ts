import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lingmo.org";
  const pages = ["", "about", "download", "documentation", "releases", "blog", "community", "gallery", "donate", "sponsors", "faq", "privacy", "license", "search", "status", "security"];

  /**
   * 语言前缀必须与 `routing.locales` 完全一致（`zh-CN` / `zh-TW` 大小写敏感）。
   * 之前这里写的是硬编码的 `zh-cn` / `zh-tw`，与真实路由不一致，
   * 会把大写形式的规范页面拆成两份、并让爬虫抓到不存在的 URL 而 404。
   * 默认语言使用空前缀，保持 `localePrefix: "as-needed"` 的既有对外形态。
   */
  const locales = ["", ...routing.locales.filter((locale) => locale !== routing.defaultLocale)];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      const path = [locale, page].filter(Boolean).join("/");
      entries.push({
        url: `${baseUrl}/${path}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "monthly" : "weekly",
        priority: page === "" ? 1.0 : 0.8,
      });
    }
  }

  return entries;
}
