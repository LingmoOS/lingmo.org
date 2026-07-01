import { NextRequest, NextResponse } from "next/server";
import updatesData from "@/../public/content/updates.json";

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

  if (!channelData.architectures[arch]) {
    return NextResponse.json({ error: "Architecture not available for this channel" }, { status: 400, headers: corsHeaders });
  }

  if (current === channelData.version) {
    return NextResponse.json({ success: true, latest: false }, { headers: corsHeaders });
  }

  const archDownload = channelData.architectures[arch];

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
}
