import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import updateData from "@/../public/content/update.json";
import { isUpdateAvailable, parseBuildVersion } from "@/lib/buildVersion";
import { mdToHtml } from "@/lib/mdToHtml";

type UpdateChannel = {
  latest: {
    version: string;
    buildVersion: string;
    buildCode: number;
    releaseDate: string;
    security: boolean;
    critical: boolean;
    mandatory: boolean;
    releaseNotesUrl: string;
    download: Record<string, { iso: string; checksum: string }>;
  };
};

type UpdateConfig = {
  channels: Record<string, UpdateChannel>;
};

const config = updateData as UpdateConfig;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function loadReleaseNotes(buildVersion: string, locale: string): { summary: string } | null {
  const base = join(process.cwd(), "public", "content", "releases", buildVersion);
  const locales = [locale, locale.split("-")[0], "en"];
  for (const l of locales) {
    const path = join(base, `${l}.md`);
    if (existsSync(path)) {
      const md = readFileSync(path, "utf-8");
      return { summary: mdToHtml(md) };
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel") || "stable";
  const arch = searchParams.get("arch") || "x86_64";
  const build = searchParams.get("build");
  const locale = searchParams.get("locale") || "en";

  if (!build) {
    return NextResponse.json({ error: "Missing required parameter: build" }, { status: 400, headers: corsHeaders });
  }

  const parsedBuild = parseBuildVersion(build);
  if (!parsedBuild) {
    return NextResponse.json({ error: "Invalid build version format" }, { status: 400, headers: corsHeaders });
  }

  const channelData = config.channels[channel];
  if (!channelData) {
    return NextResponse.json({ error: "Invalid channel" }, { status: 400, headers: corsHeaders });
  }

  if (!channelData.latest.download[arch]) {
    return NextResponse.json({ error: "Architecture not available for this channel" }, { status: 400, headers: corsHeaders });
  }

  const latest = channelData.latest;
  const available = isUpdateAvailable(build, latest.buildVersion);

  const response: Record<string, unknown> = {
    success: true,
    updateAvailable: available,
    currentBuild: build,
  };

  if (available) {
    const notes = loadReleaseNotes(latest.buildVersion, locale);
    const archDownload = latest.download[arch];

    response.latest = {
      version: latest.version,
      buildVersion: latest.buildVersion,
      buildCode: latest.buildCode,
      releaseDate: latest.releaseDate,
      security: latest.security,
      critical: latest.critical,
      mandatory: latest.mandatory,
    };
    response.summary = notes?.summary || "";
    response.releaseNotesUrl = latest.releaseNotesUrl;
    response.download = {
      iso: archDownload.iso,
      checksum: archDownload.checksum,
    };
  }

  return NextResponse.json(response, { headers: corsHeaders });
}
