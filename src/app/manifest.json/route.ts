import { NextResponse } from "next/server";
import updatesData from "@/../public/content/updates.json";
// 说明：此处不再声明 runtime = "edge"。
// OpenNext 在 Cloudflare Workers 上以 Node.js 运行时执行 route handler（依赖 nodejs_compat），
// 显式声明 edge 运行时会导致该路由无法被适配器打进 Worker。
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
