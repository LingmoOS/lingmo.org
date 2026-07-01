import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lingmo.org";
  const locales = ["", "zh-cn", "zh-tw", "en", "ja"];
  const pages = ["", "about", "download", "documentation", "releases", "blog", "community", "gallery", "donate", "sponsors", "faq", "privacy", "license", "search"];

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
