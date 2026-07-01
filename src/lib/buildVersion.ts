const STAGE_PRIORITY: Record<string, number> = {
  a: 1,
  b: 2,
  R: 3,
  d: 4,
  rc: 5,
  LTS: 6,
};

export interface ParsedBuildVersion {
  major: number;
  stage: string;
  revision: number;
  raw: string;
}

const BUILD_VERSION_RE = /^(\d+)([a-zA-Z]+)(\d+)$/;

export function parseBuildVersion(bv: string): ParsedBuildVersion | null {
  const m = bv.match(BUILD_VERSION_RE);
  if (!m) return null;
  return {
    major: parseInt(m[1]!, 10),
    stage: m[2]!,
    revision: parseInt(m[3]!, 10),
    raw: bv,
  };
}

function stagePriority(stage: string): number {
  return STAGE_PRIORITY[stage] ?? 0;
}

export function compareBuildVersion(a: string, b: string): number {
  const pa = parseBuildVersion(a);
  const pb = parseBuildVersion(b);
  if (!pa || !pb) return 0;

  if (pa.major !== pb.major) return pa.major - pb.major;

  const sa = stagePriority(pa.stage);
  const sb = stagePriority(pb.stage);
  if (sa !== sb) return sa - sb;

  return pa.revision - pb.revision;
}

export function isUpdateAvailable(current: string, latest: string): boolean {
  return compareBuildVersion(latest, current) > 0;
}
