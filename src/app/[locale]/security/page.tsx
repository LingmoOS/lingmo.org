import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import advisoriesFile from "@/../public/content/security-advisories.json";

/**
 * 安全公告页（服务端组件，请求期渲染）。
 *
 * 数据在构建期从 `public/content/security-advisories.json` 打包进来，
 * 请求期不发网络请求；列表为空时显示「暂无公告」。
 *
 * 不声明 `generateStaticParams()`：`[locale]/layout.tsx` 已声明 `runtime = "edge"`，
 * edge 与静态预渲染参数互斥，同时出现会让构建失败。
 */

type Severity = "critical" | "high" | "medium" | "low";

interface Advisory {
  id: string;
  affected: string;
  severity: Severity;
  date: string;
  url?: string;
}

/** 私有漏洞报告入口，用于接收未公开的漏洞细节。 */
const PRIVATE_ADVISORY_URL = "https://github.com/LingmoOS/lingmo.org/security/advisories/new";

/** 严重度只用文字 + 现有调色板（danger / warning / success）表达，不新增样式。 */
const severityClass: Record<Severity, string> = {
  critical: "font-semibold text-danger",
  high: "font-semibold text-danger",
  medium: "font-medium text-warning",
  low: "text-success",
};

const advisories = (advisoriesFile as unknown as { advisories: Advisory[] }).advisories;

/** 新公告排在前面；没有日期的排在最后。 */
const sortedAdvisories = [...advisories].sort((a, b) => {
  if (a.date === b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;
  return a.date < b.date ? 1 : -1;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "security" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "security" });

  /** 严重度标签走 i18n；用 switch 而不是拼接 key，避免依赖动态键。 */
  const severityLabel = (severity: Severity): string => {
    switch (severity) {
      case "critical":
        return t("severityCritical");
      case "high":
        return t("severityHigh");
      case "medium":
        return t("severityMedium");
      case "low":
        return t("severityLow");
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
        <h2 className="mb-2 text-2xl font-bold">{t("listTitle")}</h2>
        <p className="mb-8 text-sm text-muted dark:text-muted-dark">{t("listDescription")}</p>

        {sortedAdvisories.length === 0 ? (
          <Card glass={false} hover={false}>
            <p className="py-8 text-center text-sm text-muted dark:text-muted-dark">{t("empty")}</p>
          </Card>
        ) : (
          <Card glass={false} hover={false} className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="text-muted dark:text-muted-dark">
                <tr className="border-b border-border dark:border-border-dark">
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("colId")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("colAffected")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("colSeverity")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("colDate")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("colLink")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAdvisories.map((advisory) => (
                  <tr
                    key={advisory.id}
                    className="border-b border-border last:border-0 dark:border-border-dark"
                  >
                    <td className="px-4 py-3 font-mono">{advisory.id}</td>
                    <td className="px-4 py-3">{advisory.affected}</td>
                    <td className={`px-4 py-3 ${severityClass[advisory.severity]}`}>
                      {severityLabel(advisory.severity)}
                    </td>
                    <td className="px-4 py-3">{advisory.date || t("tbd")}</td>
                    <td className="px-4 py-3">
                      {advisory.url ? (
                        <a
                          href={advisory.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary transition-colors hover:text-primary-hover"
                        >
                          {t("viewLink")}
                        </a>
                      ) : (
                        <span className="text-muted dark:text-muted-dark">{t("noLink")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold">{t("reportTitle")}</h2>
          <p className="text-sm leading-relaxed text-muted dark:text-muted-dark">
            {t("reportText")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted dark:text-muted-dark">
            {t("reportHint")}
          </p>
          <p className="mt-6 rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
            {t("noPublicDisclosure")}
          </p>
          <p className="mt-6">
            <a
              href={PRIVATE_ADVISORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary-hover"
            >
              {t("reportLink")}
            </a>
          </p>
          <p className="mt-4 break-all font-mono text-xs text-muted dark:text-muted-dark">
            {PRIVATE_ADVISORY_URL}
          </p>
        </div>
      </Section>
    </>
  );
}
