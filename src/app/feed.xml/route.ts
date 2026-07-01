import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lingmo.org";

  const posts = [
    {
      title: "Announcing Lingmo OS 1.0 — A New Dawn for Linux",
      slug: "announcing-lingmo-os-1-0",
      date: "2026-06-15",
      description:
        "After years of development, we are thrilled to announce the first stable release of Lingmo OS.",
    },
    {
      title: "Lingmo Desktop: A Deep Dive into Our Custom Desktop Environment",
      slug: "lingmo-desktop-deep-dive",
      date: "2026-06-20",
      description:
        "Explore the architecture and design philosophy behind the Lingmo Desktop Environment.",
    },
    {
      title: "Security First: How Lingmo OS Protects Your Data",
      slug: "security-in-lingmo-os",
      date: "2026-06-28",
      description:
        "Learn about the security features built into Lingmo OS.",
    },
    {
      title: "Our Journey to Wayland: Why We Chose the Future of Display Servers",
      slug: "wayland-journey",
      date: "2026-07-05",
      description:
        "Why Lingmo OS uses Wayland as the default display server.",
    },
  ];

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${post.title}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${post.description}</description>
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Lingmo OS Blog</title>
    <link>${baseUrl}</link>
    <description>Latest news and updates from Lingmo OS development</description>
    <language>en</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
