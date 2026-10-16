"use client";

/**
 * OBS 打包状态卡片（尽力而为）
 *
 * 实测 api.opensuse.org 需要 SUSE 开发者账号鉴权（匿名请求返回 401，
 * 且响应不带 Access-Control-Allow-Origin），浏览器里通常读不到数据。
 * 因此这里只在成功时展示构包结果，失败时给出说明与跳转链接，
 * 且不影响仓库 CI 与 ISO 两个区块。
 */

import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { OBS_PROJECT, OBS_MONITOR_URL } from "@/lib/buildStatus";
import { cn } from "@/lib/utils";
import { STATUS_BADGE_CLASS, STATUS_KEY, obsStatusToBuildStatus } from "./format";
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
    return t("obsReasonCors");
  })();

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
        <div className="space-y-3">
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
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    STATUS_BADGE_CLASS[status],
                  )}
                >
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 text-sm text-muted dark:text-muted-dark">
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
          <ExternalLink className="h-4 w-4" />
          {t("obsOpenMonitor")}
        </a>
      </div>
    </Card>
  );
}