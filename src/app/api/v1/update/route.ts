import { NextRequest, NextResponse } from "next/server";
import updatesData from "@/../public/content/updates.json";
// 说明：此处不再声明 runtime = "edge"。
// OpenNext 在 Cloudflare Workers 上以 Node.js 运行时执行 route handler（依赖 nodejs_compat），
// 显式声明 edge 运行时会导致该路由无法被适配器打进 Worker。
type ChannelData = {
  version: string;
  build: number;
  mandatory: boolean;
  releaseNotes: string;
  architectures: Record<string, { iso: string; sha256: string }>;
};

type UpdatesConfig = {
  channels: Record<string, ChannelData>;
};

const config = updatesData as UpdatesConfig;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel") || "stable";
  const arch = searchParams.get("arch") || "x86_64";
  const current = searchParams.get("current");

  const channelData = config.channels[channel];

  if (!channelData) {
    return NextResponse.json({ error: "Invalid channel" }, { status: 400, headers: corsHeaders });
  }

  const archDownload = channelData.architectures[arch];
  if (!archDownload) {
    return NextResponse.json({ error: "Architecture not available for this channel" }, { status: 400, headers: corsHeaders });
  }

  if (current === channelData.version) {
    return NextResponse.json({ success: true, latest: false }, { headers: corsHeaders });
  }

  return NextResponse.json({
    success: true,
    latest: {
      version: channelData.version,
      build: channelData.build,
      mandatory: channelData.mandatory,
      download: {
        iso: archDownload.iso,
        sha256: archDownload.sha256,
      },
      releaseNotes: channelData.releaseNotes,
    },
  }, { headers: corsHeaders });
}
