import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Bug, ExternalLink, FileText, GitPullRequest, HardDrive, Languages } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";

/**
 * 参与贡献页（服务端组件，纯静态内容）。
 *
 * 只列仓库里实际存在的仓库与 package.json 里实际存在的脚本；
 * 没有的规范文件（如行为准则）不假装存在，统一指向各仓库的 Issue / PR 模板。
 *
 * 不声明 `generateStaticParams()`：`[locale]/layout.tsx` 已声明 `runtime = "edge"`。
 */

const ORG_URL = "https://github.com/LingmoOS";

const localDevCommands = `pnpm install
pnpm dev`;

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl bg-black/5 p-4 text-xs leading-relaxed dark:bg-white/5">
      <code className="font-mono">{children}</code>
    </pre>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contribute" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function ContributePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contribute" });

  const ways = [
    { icon: Bug, title: t("wayIssueTitle"), description: t("wayIssueDesc") },
    { icon: GitPullRequest, title: t("wayPrTitle"), description: t("wayPrDesc") },
    { icon: Languages, title: t("wayTranslationTitle"), description: t("wayTranslationDesc") },
    { icon: HardDrive, title: t("wayTestingTitle"), description: t("wayTestingDesc") },
    { icon: FileText, title: t("wayDocsTitle"), description: t("wayDocsDesc") },
  ];

  const repos = [
    {
      name: "lingmo-builder",
      href: "https://github.com/LingmoOS/lingmo-builder",
      description: t("repoBuilderDesc"),
    },
    {
      name: "live-build",
      href: "https://github.com/LingmoOS/live-build",
      description: t("repoLiveBuildDesc"),
    },
    {
      name: "live-boot",
      href: "https://github.com/LingmoOS/live-boot",
      description: t("repoLiveBootDesc"),
    },
    {
      name: "lingmo-installer-config",
      href: "https://github.com/LingmoOS/lingmo-installer-config",
      description: t("repoInstallerDesc"),
    },
    {
      name: "lingmo.org",
      href: "https://github.com/LingmoOS/lingmo.org",
      description: t("repoSiteDesc"),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />

      <Section>
        <h2 className="mb-8 text-2xl font-bold">{t("waysTitle")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ways.map((way) => (
            <Card key={way.title} className="h-full">
              <way.icon className="h-8 w-8 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">{way.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted dark:text-muted-dark">
                {way.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <h2 className="mb-2 text-2xl font-bold">{t("reposTitle")}</h2>
        <p className="mb-8 text-sm text-muted dark:text-muted-dark">{t("reposDescription")}</p>

        <Card glass={false} hover={false} className="p-0">
          <ul>
            {repos.map((repo) => (
              <li
                key={repo.name}
                className="border-b border-border last:border-0 dark:border-border-dark"
              >
                <a
                  href={repo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span>
                    <span className="block font-mono text-sm">{repo.name}</span>
                    <span className="mt-1 block text-xs text-muted dark:text-muted-dark">
                      {repo.description}
                    </span>
                  </span>
                  <ExternalLink
                    className="h-4 w-4 shrink-0 text-muted dark:text-muted-dark"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Card>

        <p className="mt-6">
          <a
            href={ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            {t("githubOrg")}
          </a>
        </p>
      </Section>

      <Section>
        <h2 className="mb-4 text-2xl font-bold">{t("localDevTitle")}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted dark:text-muted-dark">
          {t("localDevText")}
        </p>
        <CodeBlock>{localDevCommands}</CodeBlock>
        <p className="mt-3 text-xs text-muted dark:text-muted-dark">{t("localDevScripts")}</p>
        <p className="mt-6">
          <Link
            href="/documentation"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            {t("readDocs")}
          </Link>
        </p>
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold">{t("guidelinesTitle")}</h2>
          <p className="text-sm leading-relaxed text-muted dark:text-muted-dark">
            {t("guidelinesText")}
          </p>
        </div>
      </Section>
    </>
  );
}
