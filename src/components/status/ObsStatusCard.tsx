"use client";

/**
 * OBS 打包状态卡片（尽力而为）
 *
 * api.opensuse.org 需要 Basic Auth，且响应没有 CORS 头，浏览器直连永远读不到。
 * 配置了 OBS_USERNAME / OBS_PASSWORD 后由服务端代理代取并精简结果，这里只管展示；
 * 未配置或失败时给出说明与跳转链接，且不影响仓库 CI 与 ISO 两个区块。
 */

import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "./StatusBadge";
import { OBS_PROJECT, OBS_MONITOR_URL } from "@/lib/buildStatus";
import { obsStatusToBuildStatus } from "./format";
import type { ObsOutcomeSnapshot } from "@/types";

interface ObsStatusCardProps {
  obs: ObsOutcomeSnapshot;
  /** 首次加载中，尚未拿到任何结果 */
  loading: boolean;
}

export function ObsStatusCard({ obs, loading }: ObsStatusCardProps) {
  const t = useTranslations("status");

  /** 失败原因对应的说明文案 */
  const reasonText = (() => {
    if (obs.reason === "auth") {
      return t("obsReasonAuth");
    }
    if (obs.reason === "network") {
      return t("obsReasonNetwork");
    }
    if (obs.reason === "aborted") {
      return t("obsReasonAborted");
    }
    if (obs.reason === "noCredentials") {
      return t("obsReasonNoCredentials");
    }
    if (obs.reason === "parse") {
      return t("obsReasonParse");
    }
    return t("obsReasonCors");
  })();

  /** 结果被截断时给出总数，避免误以为只有这几条 */
  const total = obs.total ?? obs.results.length;

  return (
    <Card hover={false} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{t("obsTitle")}</h3>
        <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-medium text-muted dark:bg-white/10 dark:text-muted-dark">
          {OBS_PROJECT}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-muted dark:text-muted-dark">{t("obsLoading")}</p>
      ) : obs.available && obs.results.length > 0 ? (
        <div className="space-y-3" aria-live="polite">
          {obs.results.map((item, index) => {
            const status = obsStatusToBuildStatus(item.status);
            return (
              <div
                key={`${item.repository}-${item.arch}-${item.package}-${index}`}
                className="flex items-center justify-between gap-3 border-t border-border dark:border-border-dark pt-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.package}</p>
                  <p className="mt-0.5 truncate text-xs text-muted dark:text-muted-dark">
                    {item.repository}
                    {item.arch ? ` · ${item.arch}` : ""}
                  </p>
                </div>
                <StatusBadge status={status} label={item.status} />
              </div>
            );
          })}
          {obs.total !== undefined && obs.total > obs.results.length ? (
            <p className="text-xs text-muted dark:text-muted-dark">
              {t("obsTruncated", { shown: obs.results.length, total })}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2 text-sm text-muted dark:text-muted-dark" aria-live="polite">
          <p>{t("obsUnavailable")}</p>
          <p className="text-xs">{reasonText}</p>
        </div>
      )}

      <div>
        <a
          href={OBS_MONITOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          {t("obsOpenMonitor")}
        </a>
      </div>
    </Card>
  );
}
