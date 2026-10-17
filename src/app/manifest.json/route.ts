import { NextResponse } from "next/server";
import updatesData from "@/../public/content/updates.json";
// 当前部署是 Cloudflare Pages + @cloudflare/next-on-pages：该适配器只把声明了
// Edge Runtime 的路由打进 `_worker.js`，因此这里保留 edge 声明（与迁移前一致）。
export const runtime = "edge";
type UpdatesConfig = {
  channels: Record<string, { version: string }>;
};

const config = updatesData as UpdatesConfig;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export const revalidate = 300;

export async function GET() {
  const channels: Record<string, string> = {};
  for (const [key, data] of Object.entries(config.channels)) {
    channels[key] = data.version;
  }

  return NextResponse.json(
    {
      apiVersion: 1,
      generatedAt: new Date().toISOString(),
      channels,
      architectures: ["x86_64", "arm64", "loongarch"],
    },
    { headers: corsHeaders }
  );
}
