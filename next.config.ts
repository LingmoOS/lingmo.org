import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 375, 390, 430, 480, 768, 1024, 1280, 1440, 1536, 1920, 2560],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

// 让 `next dev` 也能访问 Cloudflare 绑定（wrangler.worker.jsonc 中声明的 ASSETS 等）。
// 仅在开发模式下生效，生产构建不受影响。
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

export default withNextIntl(config);
