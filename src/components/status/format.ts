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