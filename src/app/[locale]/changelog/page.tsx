import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import changelogFile from "@/../public/content/changelog.json";

/**
 * 更新日志页（服务端组件，请求期渲染）。
 *
 * 数据来自 `public/content/changelog.json`，构建期打包；条目按版本倒序渲染，
 * 内容只用纯文本与列表，不引入 markdown 依赖。
 *
 * 不声明 `generateStaticParams()`：`[locale]/layout.tsx` 已声明 `runtime = "edge"`。
 */

interface ChangelogEntry {
  version: string;
  date: string;
  highlights?: string[];
}

const entries = (changelogFile as unknown as { entries: ChangelogEntry[] }).entries;

/** 版本号按数字段比较，26R01 排在 25R03 之前。 */
const sortedEntries = [...entries].sort((a, b) =>
  b.version.localeCompare(a.version, undefined, { numeric: true }),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "changelog" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function ChangelogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "changelog" });

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />

      <Section>
        {sortedEntries.length === 0 ? (
          <Card glass={false} hover={false}>
            <p className="py-8 text-center text-sm text-muted dark:text-muted-dark">{t("empty")}</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedEntries.map((entry) => (
              <Card key={entry.version} glass={false} hover={false}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-mono text-xl font-bold">{entry.version}</h2>
                  <span className="text-xs text-muted dark:text-muted-dark">
                    {entry.date || t("tbd")}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-semibold">{t("highlightsLabel")}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted dark:text-muted-dark">
                  {(entry.highlights ?? []).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
