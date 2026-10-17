"use client";

/**
 * 最近 N 次运行的趋势方条
 *
 * 状态由「颜色 + 文字摘要 + 每条的 title / aria-label」共同表达，不只靠颜色：
 * 摘要给出成功 / 失败次数，方条本身带完整的「结论 · 时间」描述。
 * 方条固定宽高，容器 flex-wrap，窄屏下自动换行。
 */

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { STATUS_KEY, TREND_BAR_CLASS, relativeTime, type Translate } from "./format";
import type { RunTrendItem } from "@/types";

interface TrendBarsProps {
  trend: RunTrendItem[];
  /** 当前语言，用于相对时间格式化 */
  locale: string;
}

export function TrendBars({ trend, locale }: TrendBarsProps) {
  const t = useTranslations("status");
  /** 收敛成单签名，便于传给纯工具函数 */
  const translate = t as unknown as Translate;

  if (trend.length === 0) {
    return null;
  }

  const success = trend.filter((item) => item.status === "success").length;
  const failure = trend.filter((item) => item.status === "failure").length;

  return (
    <div className="mt-3" aria-live="polite">
      <p className="text-xs text-muted dark:text-muted-dark">
        {t("trendTitle")} ·{" "}
        {t("trendSummary", { success, failure, total: trend.length })}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {trend.map((item, index) => {
          const label = t("trendItem", {
            status: t(STATUS_KEY[item.status]),
            time: relativeTime(item.createdAt, locale, translate),
          });
          return (
            <span
              key={`${item.runNumber}-${index}`}
              role="img"
              aria-label={label}
              title={label}
              className={cn("h-1.5 w-3 rounded-sm", TREND_BAR_CLASS[item.status])}
            />
          );
        })}
      </div>
    </div>
  );
}
