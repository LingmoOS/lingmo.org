"use client";

/**
 * ISO 构建 / 最新发布卡片
 *
 * 展示 lingmo-builder 的最新一次运行（作为 ISO 构建状态），以及最新发布的
 * 版本号、发布时间与全部资产文件。ISO 被切成 .part-aa / .part-ab 等分片，
 * 这里如实展示文件名、大小与下载链接，不做任何合并或改名。
 */

import { useTranslations } from "next-intl";
import { Calendar, Download, Package } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { releasesUrl } from "@/lib/buildStatus";
import { cn } from "@/lib/utils";
import {
  STATUS_BADGE_CLASS,
  STATUS_KEY,
  errorMessage,
  formatBytes,
  relativeTime,
  type Translate,
} from "./format";
import type { RepoStatusResult, ReleaseInfo } from "@/types";

/** ISO 构建状态所属仓库 */
const ISO_REPO = "lingmo-builder";

interface ReleaseStatusCardProps {
  /** lingmo-builder 的最新运行（ISO 构建状态） */
  iso: RepoStatusResult | null;
  /** 最新发布；为 null 表示没有发布或读取失败 */
  release: ReleaseInfo | null;
  /** 是否为「确实没有发布」（否则视为读取失败） */
  releaseMissing: boolean;
  locale: string;
}

export function ReleaseStatusCard({
  iso,
  release,
  releaseMissing,
  locale,
}: ReleaseStatusCardProps) {
  const t = useTranslations("status");
  /** 收敛成单签名，便于传给纯工具函数 */
  const translate = t as unknown as Translate;

  const run = iso?.run ?? null;
  const badgeClass = run ? STATUS_BADGE_CLASS[run.status] : STATUS_BADGE_CLASS.unknown;
  const badgeLabel = run ? t(STATUS_KEY[run.status]) : t("statusUnknown");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ISO 构建状态：来自 lingmo-builder 的 Actions 运行 */}
      <Card className="h-full flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold">{t("isoBuildTitle")}</h3>
          <span
            className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", badgeClass)}
          >
            {badgeLabel}
          </span>
        </div>

        <div className="mt-4 flex-1 space-y-2 text-sm text-muted dark:text-muted-dark">
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

      {/* 最新发布：版本号、发布时间与资产文件 */}
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
                <Calendar className="h-4 w-4" />
                <span>{relativeTime(release.publishedAt, locale, translate)}</span>
              </p>
            </div>

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
                      <Download className="h-4 w-4" />
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
              <Package className="h-4 w-4" />
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