"use client";

/**
 * 构建状态页面
 *
 * - 仓库 CI 状态：GitHub Actions（公开接口，无需 token）
 * - ISO 构建 / 发布状态：lingmo-builder 的 Actions 运行与最新 Release
 * - OBS 打包状态：尽力而为，浏览器读不到时只展示跳转链接
 *
 * 页面整体复用官网既有组件（PageHeader / Section / Card / Button）与配色，
 * 不修改任何样式表，也不改动其它页面的外观。
 */

import { useLocale, useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { RepoStatusCard } from "@/components/status/RepoStatusCard";
import { ReleaseStatusCard } from "@/components/status/ReleaseStatusCard";
import { ObsStatusCard } from "@/components/status/ObsStatusCard";
import { relativeTime, type Translate } from "@/components/status/format";
import { useStatus } from "@/hooks/useStatus";
import { ORG_URL, REFRESH_INTERVAL_MS, STATUS_REPOS, actionsUrl } from "@/lib/buildStatus";

/** ISO 构建状态对应的仓库 */
const ISO_REPO = "lingmo-builder";

export default function StatusPage() {
  const t = useTranslations("status");
  const locale = useLocale();
  /** 收敛成单签名，便于传给纯工具函数 */
  const translate = t as unknown as Translate;
  const { snapshot, loading, refreshing, refresh, canRefresh } = useStatus();

  /** 自动刷新间隔（分钟），展示给用户，避免误解「实时」的粒度 */
  const intervalMinutes = Math.round(REFRESH_INTERVAL_MS / 60_000);

  /** 配额紧张（剩余次数不足一轮刷新）时的提示 */
  const rateLimitWarning = (() => {
    const rateLimit = snapshot?.rateLimit;
    if (!rateLimit || rateLimit.remaining > STATUS_REPOS.length) {
      return null;
    }
    if (rateLimit.resetAt) {
      const minutes = Math.max(
        1,
        Math.ceil((Date.parse(rateLimit.resetAt) - Date.now()) / 60_000),
      );
      return t("rateLimitWarning", { minutes });
    }
    return t("rateLimitWarningUnknown");
  })();

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />

      {/* 刷新控制：数据新鲜度、自动刷新间隔与手动刷新 */}
      <Section className="pt-0 pb-0 md:pt-0 md:pb-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted dark:text-muted-dark">
            {snapshot
              ? `${t("lastUpdated")} ${relativeTime(snapshot.fetchedAt, locale, translate)} · ${t("autoRefresh", { minutes: intervalMinutes })}`
              : t("loading")}
          </p>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading || !canRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {refreshing ? t("refreshing") : t("refreshNow")}
          </Button>
        </div>

        {rateLimitWarning ? (
          <p className="mt-4 rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
            {rateLimitWarning}
          </p>
        ) : null}
      </Section>

      {/* A. 仓库 CI 状态 */}
      <Section>
        <h2 className="mb-2 text-2xl font-bold">{t("repoSectionTitle")}</h2>
        <p className="mb-8 text-sm text-muted dark:text-muted-dark">
          {t("repoSectionDescription")}
        </p>

        {loading && !snapshot ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(snapshot?.repos ?? []).map((item, index) => (
              <RepoStatusCard key={item.repo} item={item} locale={locale} index={index} />
            ))}
          </div>
        )}

        <div className="mt-8">
          <a
            href={ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            {t("viewAllActions")}
          </a>
        </div>
      </Section>

      {/* B. ISO 构建 / 发布状态 */}
      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <h2 className="mb-2 text-2xl font-bold">{t("isoSectionTitle")}</h2>
        <p className="mb-8 text-sm text-muted dark:text-muted-dark">
          {t("isoSectionDescription")}
        </p>
        <ReleaseStatusCard
          iso={snapshot?.repos.find((item) => item.repo === ISO_REPO) ?? null}
          release={snapshot?.release ?? null}
          releaseMissing={snapshot?.releaseMissing ?? false}
          locale={locale}
        />
        <p className="mt-6 text-xs text-muted dark:text-muted-dark">
          {t("isoBuildLinkHint")}{" "}
          <a
            href={actionsUrl(ISO_REPO)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            {ISO_REPO}
          </a>
        </p>
      </Section>

      {/* C. OBS 打包状态（尽力而为） */}
      <Section>
        <h2 className="mb-2 text-2xl font-bold">{t("obsSectionTitle")}</h2>
        <p className="mb-8 text-sm text-muted dark:text-muted-dark">
          {t("obsSectionDescription")}
        </p>
        <ObsStatusCard
          obs={snapshot?.obs ?? { available: false, results: [], reason: "" }}
          loading={loading && !snapshot}
        />
      </Section>
    </>
  );
}