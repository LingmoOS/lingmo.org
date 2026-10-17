"use client";

/**
 * 仓库 CI 状态卡片
 *
 * 只复用官网已有的 class / 组件写法（glass 卡片、muted 文本、primary 强调色、
 * 与 releases 页一致的 rounded-full 徽章），不修改任何样式表。
 *
 * 卡片里同时给出：
 * - 徽章：颜色 + 图标 + 文字三重表达状态；
 * - 最近 N 次运行的趋势方条（结论与时间在 title / aria-label 里）；
 * - 动态区域带 aria-live，数据刷新后读屏能感知到变化。
 */

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { GitBranch, History } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "./StatusBadge";
import { TrendBars } from "./TrendBars";
import { actionsUrl } from "@/lib/buildStatus";
import { STATUS_KEY, errorMessage, relativeTime, type Translate } from "./format";
import type { RepoStatusResult } from "@/types";

interface RepoStatusCardProps {
  item: RepoStatusResult;
  /** 当前语言，用于相对时间格式化 */
  locale: string;
  /** 列表索引，仅用于入场动画的错峰延迟 */
  index: number;
}

export function RepoStatusCard({ item, locale, index }: RepoStatusCardProps) {
  const t = useTranslations("status");
  /**
   * next-intl 返回的翻译函数带有重载签名，这里收敛成单签名的 Translate，
   * 便于在纯工具函数之间传递。
   */
  const translate = t as unknown as Translate;

  const run = item.run;
  const badgeLabel = run ? t(STATUS_KEY[run.status]) : t("statusUnknown");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{run?.repo ?? item.repo}</h3>
            {run ? (
              <p className="mt-1 truncate text-xs text-muted dark:text-muted-dark">
                {run.workflowName}
              </p>
            ) : null}
          </div>
          <StatusBadge status={run?.status ?? "unknown"} label={badgeLabel} />
        </div>

        <div className="mt-4 flex-1 space-y-2 text-sm text-muted dark:text-muted-dark" aria-live="polite">
          {run ? (
            <>
              <p className="flex items-center gap-1.5">
                <GitBranch className="h-4 w-4" aria-hidden="true" />
                <span className="truncate">
                  {run.branch || t("branchUnknown")}
                  {run.shortSha ? ` · ${run.shortSha}` : ""}
                </span>
              </p>
              <p className="flex items-center gap-1.5">
                <History className="h-4 w-4" aria-hidden="true" />
                <span>{relativeTime(run.createdAt || run.updatedAt, locale, translate)}</span>
              </p>
            </>
          ) : (
            <p>{item.error ? errorMessage(item.error, translate) : t("noRun")}</p>
          )}

          <TrendBars trend={item.trend ?? []} locale={locale} />
        </div>

        <div className="mt-4">
          <a
            href={run ? run.htmlUrl : actionsUrl(item.repo)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            {run ? t("viewRun") : t("viewActions")}
          </a>
        </div>
      </Card>
    </motion.div>
  );
}
