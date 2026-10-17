import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import lifecycleFile from "@/../public/content/lifecycle.json";

/**
 * 版本支持周期页（服务端组件，请求期渲染）。
 *
 * 数据来自 `public/content/lifecycle.json`，构建期打包，请求期不发网络请求。
 * 没有权威来源的日期统一显示「待公布」，页面注明以发布公告为准。
 *
 * 不声明 `generateStaticParams()`：`[locale]/layout.tsx` 已声明 `runtime = "edge"`，
 * edge 与静态预渲染参数互斥。
 */

type LifecycleStatus = "supported" | "maintenance" | "eol" | "planned";

interface LifecycleEntry {
  version: string;
  status: LifecycleStatus;
  released: string;
  supportedUntil: string;
  notes?: string;
}

/** 状态用文字 + 现有调色板表达：支持中 / 仅安全更新 / 已停止支持 / 计划中 */
const statusClass: Record<LifecycleStatus, string> = {
  supported: "font-medium text-success",
  maintenance: "font-medium text-warning",
  eol: "text-muted dark:text-muted-dark",
  planned: "font-medium text-primary",
};

const statusDot: Record<LifecycleStatus, string> = {
  supported: "bg-success",
  maintenance: "bg-warning",
  eol: "bg-muted",
  planned: "bg-primary",
};

const legendStatuses: LifecycleStatus[] = ["supported", "maintenance", "eol", "planned"];

const versions = (lifecycleFile as unknown as { versions: LifecycleEntry[] }).versions;

/** 已发布的版本排在前面；没有发布日期的排在最后。 */
const sortedVersions = [...versions].sort((a, b) => {
  if (a.released === b.released) return 0;
  if (!a.released) return 1;
  if (!b.released) return -1;
  return a.released < b.released ? 1 : -1;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lifecycle" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function LifecyclePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lifecycle" });

  const statusLabel = (status: LifecycleStatus): string => {
    switch (status) {
      case "supported":
        return t("statusSupported");
      case "maintenance":
        return t("statusMaintenance");
      case "eol":
        return t("statusEol");
      case "planned":
        return t("statusPlanned");
    }
  };

  const statusDescription = (status: LifecycleStatus): string => {
    switch (status) {
      case "supported":
        return t("legendSupportedDesc");
      case "maintenance":
        return t("legendMaintenanceDesc");
      case "eol":
        return t("legendEolDesc");
      case "planned":
        return t("legendPlannedDesc");
    }
  };

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />

      <Section>
        {sortedVersions.length === 0 ? (
          <Card glass={false} hover={false}>
            <p className="py-8 text-center text-sm text-muted dark:text-muted-dark">{t("empty")}</p>
          </Card>
        ) : (
          <Card glass={false} hover={false} className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="text-muted dark:text-muted-dark">
                <tr className="border-b border-border dark:border-border-dark">
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("colVersion")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("colStatus")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("colReleased")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("colSupportedUntil")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("colNotes")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVersions.map((entry) => (
                  <tr
                    key={entry.version}
                    className="border-b border-border last:border-0 dark:border-border-dark"
                  >
                    <td className="px-4 py-3 font-mono">{entry.version}</td>
                    <td className={`px-4 py-3 ${statusClass[entry.status]}`}>
                      {statusLabel(entry.status)}
                    </td>
                    <td className="px-4 py-3">{entry.released || t("tbd")}</td>
                    <td className="px-4 py-3">{entry.supportedUntil || t("tbd")}</td>
                    <td className="px-4 py-3">{entry.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        <p className="mt-4 text-xs text-muted dark:text-muted-dark">{t("note")}</p>
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <h2 className="mb-6 text-2xl font-bold">{t("legendTitle")}</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {legendStatuses.map((status) => (
            <div key={status} className="flex items-start gap-3">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${statusDot[status]}`} />
              <div>
                <p className={`text-sm ${statusClass[status]}`}>{statusLabel(status)}</p>
                <p className="mt-1 text-xs text-muted dark:text-muted-dark">
                  {statusDescription(status)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
