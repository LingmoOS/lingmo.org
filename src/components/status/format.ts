/**
 * 构建状态页面的展示辅助函数
 *
 * 只做「数据 -> 文案 / class」的映射，不引入任何新的设计 token，
 * 也不修改任何样式表。
 */

import type { BuildStatus } from "@/types";

/**
 * 页面内所有翻译函数的统一签名。
 * next-intl 的 useTranslations 返回值带有重载签名，传入工具函数时
 * 统一收敛成这个单签名，避免类型推断问题。
 */
export type Translate = (key: string, values?: Record<string, string | number>) => string;

/** 状态徽章样式：全部使用 globals.css 中已存在的颜色变量 */
export const STATUS_BADGE_CLASS: Record<BuildStatus, string> = {
  success: "bg-success/10 text-success",
  failure: "bg-warning/10 text-warning",
  running: "bg-primary/10 text-primary",
  queued: "bg-black/5 text-muted dark:bg-white/10 dark:text-muted-dark",
  cancelled: "bg-black/5 text-muted dark:bg-white/10 dark:text-muted-dark",
  skipped: "bg-black/5 text-muted dark:bg-white/10 dark:text-muted-dark",
  unknown: "bg-black/5 text-muted dark:bg-white/10 dark:text-muted-dark",
};

/** 状态对应的 i18n key，与 messages/*.json 中 status.* 的命名保持一致 */
export const STATUS_KEY: Record<BuildStatus, string> = {
  success: "statusSuccess",
  failure: "statusFailure",
  running: "statusRunning",
  queued: "statusQueued",
  cancelled: "statusCancelled",
  skipped: "statusSkipped",
  unknown: "statusUnknown",
};

/**
 * 趋势小方条的填充色：同样只用已存在的颜色变量，
 * 与徽章使用同一套语义（成功=success、失败=warning、进行中=primary）。
 */
export const TREND_BAR_CLASS: Record<BuildStatus, string> = {
  success: "bg-success",
  failure: "bg-warning",
  running: "bg-primary",
  queued: "bg-black/15 dark:bg-white/25",
  cancelled: "bg-black/15 dark:bg-white/25",
  skipped: "bg-black/10 dark:bg-white/15",
  unknown: "bg-black/10 dark:bg-white/15",
};

/**
 * OBS 构包结果状态 -> 归一化状态。
 * OBS 常见取值：succeeded / failed / broken / unresolvable / disabled / building 等。
 */
export function obsStatusToBuildStatus(status: string): BuildStatus {
  const normalized = status.toLowerCase();
  if (normalized === "succeeded") {
    return "success";
  }
  if (normalized === "failed" || normalized === "broken" || normalized === "unresolvable") {
    return "failure";
  }
  if (normalized === "building" || normalized === "scheduled" || normalized === "dispatching") {
    return "running";
  }
  if (normalized === "disabled" || normalized === "excluded" || normalized === "locked") {
    return "skipped";
  }
  return "unknown";
}

/** 把错误描述转成面向用户的文案 */
export function errorMessage(error: string, t: Translate): string {
  if (error.startsWith("rateLimited")) {
    const minutes = error.split(":")[1];
    if (minutes && minutes !== "unknown") {
      return t("errorRateLimited", { minutes });
    }
    return t("errorRateLimitedUnknown");
  }
  if (error === "notFound") {
    return t("errorNotFound");
  }
  return t("errorNetwork");
}

/**
 * 相对时间：优先使用浏览器内置的 Intl.RelativeTimeFormat（跟随当前语言），
 * 环境不支持时回退到 i18n 文案，任何情况下都不会抛异常。
 */
export function relativeTime(iso: string, locale: string, t: Translate): string {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) {
    return t("timeUnknown");
  }

  const diffMs = time - Date.now();
  const absMs = Math.abs(diffMs);

  try {
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (absMs < 60_000) {
      return formatter.format(Math.round(diffMs / 1000), "second");
    }
    if (absMs < 3_600_000) {
      return formatter.format(Math.round(diffMs / 60_000), "minute");
    }
    if (absMs < 86_400_000) {
      return formatter.format(Math.round(diffMs / 3_600_000), "hour");
    }
    return formatter.format(Math.round(diffMs / 86_400_000), "day");
  } catch {
    if (absMs < 3_600_000) {
      return t("timeMinutesAgo", { minutes: Math.max(1, Math.round(absMs / 60_000)) });
    }
    if (absMs < 86_400_000) {
      return t("timeHoursAgo", { hours: Math.max(1, Math.round(absMs / 3_600_000)) });
    }
    return t("timeDaysAgo", { days: Math.max(1, Math.round(absMs / 86_400_000)) });
  }
}

/** 字节数格式化：ISO 分片常见 GB 级，按 KB / MB / GB 逐级展示 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 100 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

/** 分片后缀使用的进制：aa / ab / … / az / ba … */
const SUFFIX_BASE = 26;

/** 分片后缀（如 "ab"）转成从 0 开始的序号；格式不符时返回 null */
function suffixToIndex(suffix: string): number | null {
  const normalized = suffix.toLowerCase();
  if (!/^[a-z]{2}$/.test(normalized)) {
    return null;
  }
  const high = normalized.charCodeAt(0) - 97;
  const low = normalized.charCodeAt(1) - 97;
  return high * SUFFIX_BASE + low;
}

/** 序号转回分片后缀（0 -> "aa"，27 -> "ab"） */
function indexToSuffix(index: number): string {
  const high = Math.floor(index / SUFFIX_BASE);
  const low = index % SUFFIX_BASE;
  return `${String.fromCharCode(97 + high)}${String.fromCharCode(97 + low)}`;
}

/** 最新发布里分片与校验文件的完整性分析结果 */
export interface ShardAnalysis {
  /** 分片前缀，例如 `LingmoOS-3.0-x86_64.iso` */
  prefix: string;
  /** 按 aa 起算应有的分片数（最大后缀序号 + 1） */
  total: number;
  /** 缺失的分片文件名 */
  missing: string[];
  /** 找到的校验文件名（如 sha256sum.txt / *.sha256） */
  checksums: string[];
}

/**
 * 分析最新发布的资产：
 * - ISO 被切成 `.part-aa` / `.part-ab` 等分片，这里判断 aa 到最大后缀之间是否连续齐全；
 * - 同时找出 `sha256sum.txt` 或 `*.sha256` 校验文件。
 *
 * 纯函数，不抛异常；没有分片资产时 total 为 0。
 */
export function analyzeReleaseAssets(names: string[]): ShardAnalysis {
  const groups = new Map<string, Set<number>>();

  for (const name of names) {
    const match = /^(.*)\.part-([a-zA-Z]{2})$/.exec(name);
    if (!match) {
      continue;
    }
    const prefix = match[1] ?? "";
    const index = suffixToIndex(match[2] ?? "");
    if (!prefix || index === null) {
      continue;
    }
    const existing = groups.get(prefix);
    if (existing) {
      existing.add(index);
    } else {
      groups.set(prefix, new Set([index]));
    }
  }

  const checksums = names.filter(
    (name) =>
      /sha256sum\.txt$/i.test(name) || /\.sha256$/i.test(name) || /\.sha256\.txt$/i.test(name),
  );

  // 一次发布里通常只有一组分片；有多组时取分片最多的一组展示
  let bestPrefix = "";
  let bestIndexes: Set<number> = new Set();
  for (const [prefix, indexes] of groups) {
    if (indexes.size > bestIndexes.size) {
      bestPrefix = prefix;
      bestIndexes = indexes;
    }
  }

  if (bestIndexes.size === 0) {
    return { prefix: "", total: 0, missing: [], checksums };
  }

  const maxIndex = Math.max(...bestIndexes);
  const missing: string[] = [];
  for (let index = 0; index <= maxIndex; index += 1) {
    if (!bestIndexes.has(index)) {
      missing.push(`${bestPrefix}.part-${indexToSuffix(index)}`);
    }
  }

  return { prefix: bestPrefix, total: maxIndex + 1, missing, checksums };
}