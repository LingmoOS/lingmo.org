import { NextResponse } from "next/server";
import updatesData from "@/../public/content/updates.json";

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
