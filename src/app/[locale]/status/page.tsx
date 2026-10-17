"use client";

/**
 * 构建状态页面
 *
 * 数据来源有两种，页面只关心结果：
 * - 优先走同源的服务端聚合代理 `/api/status`（1 个请求，代理侧带 token 聚合 + 缓存）；
 * - 代理不可用时自动回落到浏览器直连 GitHub / OBS 公开接口。
 *
 * 仓库 CI 状态、ISO 构建（含当前步骤进度、最近 20 次趋势）与最新发布、
 * OBS 打包状态三块互相独立，任何一块失败都不影响其它区块。
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
import { ISO_REPO, ORG_URL, STATUS_REPOS, actionsUrl } from "@/lib/buildStatus";

export default function StatusPage() {
  const t = useTranslations("status");
  const locale = useLocale();
  /** 收敛成单签名，便于传给纯工具函数 */
  const translate = t as unknown as Translate;
  const { snapshot, loading, refreshing, refresh, canRefresh, intervalMs } = useStatus();

  /**
   * 自动刷新间隔文案：代理模式是 60 秒，用秒表达更直观；
   * 直连模式是 540 秒（9 分钟），用分钟表达。
   */
  const autoRefreshText =
    intervalMs < 120_000
      ? t("autoRefreshSeconds", { seconds: Math.round(intervalMs / 1000) })
      : t("autoRefresh", { minutes: Math.round(intervalMs / 60_000) });

  /** 数据来源：实时 / 缓存 + 服务端代理 / 浏览器直连 */
  const sourceText = snapshot
    ? `${t(snapshot.freshness === "cached" ? "sourceCached" : "sourceLive")} · ${t(
        snapshot.source === "proxy" ? "viaProxy" : "viaDirect",
      )}`
    : "";

  /**
   * 配额紧张（剩余次数不足一轮刷新）时的提示。
   * 只在浏览器直连时提示：走代理时配额属于服务端出口 IP，与访客无关，
   * 显示「当前 IP 的配额」会误导。
   */
  const rateLimitWarning = (() => {
    if (snapshot?.source !== "direct") {
      return null;
    }
    const rateLimit = snapshot.rateLimit;
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

      {/* 刷新控制：数据来源、上次更新时间、自动刷新间隔与手动刷新 */}
      <Section className="pt-0 pb-0 md:pt-0 md:pb-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted dark:text-muted-dark">
            {snapshot ? (
              <>
                {/* 只有数据来源会触发读屏播报，避免相对时间每分钟变化造成干扰 */}
                <span aria-live="polite">{t("sourceLabel", { source: sourceText })}</span>
                {` · ${t("lastUpdated")} ${relativeTime(snapshot.fetchedAt, locale, translate)} · ${autoRefreshText}`}
              </>
            ) : (
              t("loading")
            )}
          </p>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading || !canRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
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
          <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
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
          progress={snapshot?.isoProgress ?? null}
          isoTrend={snapshot?.isoTrend ?? []}
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
