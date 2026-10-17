"use client";

/**
 * ISO 构建 / 最新发布卡片
 *
 * 展示 lingmo-builder 的最新一次运行（作为 ISO 构建状态）、当前运行的分步进度、
 * 最近若干次运行的趋势，以及最新发布的版本号、发布时间与全部资产文件。
 * ISO 被切成 .part-aa / .part-ab 等分片，这里如实展示文件名、大小与下载链接，
 * 不做任何合并或改名，只额外判断分片是否连续齐全、是否提供了校验文件。
 */

import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "./StatusBadge";
import { TrendBars } from "./TrendBars";
import { releasesUrl } from "@/lib/buildStatus";
import { cn } from "@/lib/utils";
import {
  STATUS_KEY,
  analyzeReleaseAssets,
  errorMessage,
  formatBytes,
  relativeTime,
  type Translate,
} from "./format";
import type { RepoStatusResult, ReleaseInfo, RunProgress, RunTrendItem } from "@/types";

/** ISO 构建状态所属仓库 */
const ISO_REPO = "lingmo-builder";

interface ReleaseStatusCardProps {
  /** lingmo-builder 的最新运行（ISO 构建状态） */
  iso: RepoStatusResult | null;
  /** 最新发布；为 null 表示没有发布或读取失败 */
  release: ReleaseInfo | null;
  /** 是否为「确实没有发布」（否则视为读取失败） */
  releaseMissing: boolean;
  /** 当前运行的分步进度；直连模式下拿不到 steps，为 null */
  progress: RunProgress | null;
  /** lingmo-builder 最近若干次运行，用于趋势方条 */
  isoTrend: RunTrendItem[];
  locale: string;
}

export function ReleaseStatusCard({
  iso,
  release,
  releaseMissing,
  progress,
  isoTrend,
  locale,
}: ReleaseStatusCardProps) {
  const t = useTranslations("status");
  /** 收敛成单签名，便于传给纯工具函数 */
  const translate = t as unknown as Translate;

  const run = iso?.run ?? null;
  const badgeLabel = run ? t(STATUS_KEY[run.status]) : t("statusUnknown");

  /** 当前步骤：优先「正在执行」，否则是最后一个已完成步骤 */
  const currentStep = progress?.currentStep ?? null;
  const stepRunning = currentStep?.status === "in_progress";
  const percent =
    progress && progress.totalSteps > 0
      ? Math.min(100, Math.round((progress.completedSteps / progress.totalSteps) * 100))
      : 0;

  /** 分片与校验文件分析（纯函数，失败只会得到空结果） */
  const integrity = release
    ? analyzeReleaseAssets(release.assets.map((asset) => asset.name))
    : null;
  const checksumName = integrity?.checksums[0] ?? null;
  const missingPreview = integrity
    ? integrity.missing.length > 3
      ? `${integrity.missing.slice(0, 3).join(", ")} …`
      : integrity.missing.join(", ")
    : "";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ISO 构建状态：来自 lingmo-builder 的 Actions 运行 */}
      <Card className="h-full flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold">{t("isoBuildTitle")}</h3>
          <StatusBadge status={run?.status ?? "unknown"} label={badgeLabel} />
        </div>

        <div className="mt-4 flex-1 space-y-2 text-sm text-muted dark:text-muted-dark" aria-live="polite">
          {run ? (
            <>
              <p className="truncate">{run.workflowName}</p>
              <p className="truncate">
                {run.branch || t("branchUnknown")}
                {run.shortSha ? ` · ${run.shortSha}` : ""}
              </p>
              <p>{relativeTime(run.createdAt || run.updatedAt, locale, translate)}</p>
            </>
          ) : (
            <p>{iso?.error ? errorMessage(iso.error, translate) : t("noRun")}</p>
          )}

          {/* 当前运行的分步进度：仅在服务端代理拿到 jobs/steps 时展示 */}
          {progress && progress.totalSteps > 0 ? (
            <div className="mt-3 space-y-1.5 border-t border-border dark:border-border-dark pt-3">
              <p className="text-xs font-medium">{t("isoProgressTitle")}</p>
              {currentStep ? (
                <p className="flex items-center gap-1.5">
                  {stepRunning ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">
                    {t(stepRunning ? "isoCurrentStep" : "isoCompletedStep", {
                      step: currentStep.name,
                    })}
                  </span>
                </p>
              ) : null}
              <p className="text-xs">
                {t("isoStepsCount", {
                  done: progress.completedSteps,
                  total: progress.totalSteps,
                })}
              </p>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          ) : null}

          <TrendBars trend={isoTrend} locale={locale} />
        </div>

        <div className="mt-4">
          <a
            href={run ? run.htmlUrl : releasesUrl(ISO_REPO)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            {run ? t("viewRun") : t("viewActions")}
          </a>
        </div>
      </Card>

      {/* 最新发布：版本号、发布时间、分片完整性与资产文件 */}
      <Card className="h-full flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold">{t("latestReleaseTitle")}</h3>
          {release ? (
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {release.tagName || release.name}
            </span>
          ) : null}
        </div>

        {release ? (
          <>
            <div className="mt-4 space-y-2 text-sm text-muted dark:text-muted-dark">
              <p className="truncate">{release.name || release.tagName}</p>
              <p className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>{relativeTime(release.publishedAt, locale, translate)}</span>
              </p>
            </div>

            {/* 分片完整性 + 校验文件提示：缺失时给出提示但不夸大 */}
            {integrity ? (
              <div className="mt-3 space-y-1 text-xs" aria-live="polite">
                {integrity.total > 0 ? (
                  <p
                    className={cn(
                      "flex items-start gap-1.5",
                      integrity.missing.length > 0 ? "text-warning" : "text-success",
                    )}
                  >
                    {integrity.missing.length > 0 ? (
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      {integrity.missing.length > 0
                        ? t("shardIncomplete", {
                            count: integrity.missing.length,
                            list: missingPreview,
                          })
                        : t("shardComplete", { count: integrity.total })}
                    </span>
                  </p>
                ) : (
                  <p className="text-muted dark:text-muted-dark">{t("shardNone")}</p>
                )}
                <p className="flex items-start gap-1.5 text-muted dark:text-muted-dark">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="break-all">
                    {checksumName
                      ? t("checksumPresent", { name: checksumName })
                      : t("checksumMissing")}
                  </span>
                </p>
              </div>
            ) : null}

            <div className="mt-4 flex-1 space-y-3">
              {release.assets.length > 0 ? (
                release.assets.map((asset) => (
                  <div
                    key={asset.name}
                    className="flex items-center justify-between gap-3 border-t border-border dark:border-border-dark pt-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{asset.name}</p>
                      <p className="mt-0.5 text-xs text-muted dark:text-muted-dark">
                        {formatBytes(asset.size)} · {t("downloadsCount", { count: asset.downloadCount })}
                      </p>
                    </div>
                    <a
                      href={asset.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      {t("downloadAsset")}
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted dark:text-muted-dark">{t("noAssets")}</p>
              )}
            </div>
          </>
        ) : (
          <div className="mt-4 flex-1 space-y-3">
            <p className="flex items-center gap-1.5 text-sm text-muted dark:text-muted-dark">
              <Package className="h-4 w-4" aria-hidden="true" />
              {releaseMissing ? t("noRelease") : t("releaseUnavailable")}
            </p>
            <a
              href={releasesUrl(ISO_REPO)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              {t("viewReleases")}
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}
