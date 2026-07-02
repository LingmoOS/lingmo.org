"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Book, ChevronRight, ExternalLink } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

interface WikiSection {
  titleKey: string;
  items: { titleKey: string; slug: string }[];
}

const wikiSections: WikiSection[] = [
  {
    titleKey: "secGettingStarted",
    items: [
      { titleKey: "itemInstallationGuide", slug: "installation-guide" },
      { titleKey: "itemSystemRequirements", slug: "getting-started" },
      { titleKey: "itemFaq", slug: "faq" },
    ],
  },
  {
    titleKey: "secUserGuide",
    items: [
      { titleKey: "itemAboutWiki", slug: "about-wiki" },
      { titleKey: "itemGlossary", slug: "glossary" },
      { titleKey: "itemTutorials", slug: "tutorials" },
    ],
  },
  {
    titleKey: "secDevelopment",
    items: [
      { titleKey: "itemDevelopersGuide", slug: "develop-guide" },
    ],
  },
  {
    titleKey: "secMore",
    items: [
      { titleKey: "itemHistory", slug: "history" },
    ],
  },
];

export default function DocumentationPage() {
  const t = useTranslations("documentation");
  const params = useParams();
  const locale = params.locale as string;
  const wikiBase = locale === "zh-CN" ? "https://wiki.lingmo.org/zh" : "https://wiki.lingmo.org";

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />

      <Section>
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {wikiSections.map((section) => (
                <div key={section.titleKey}>
                  <h3 className="mb-2 text-sm font-semibold text-muted dark:text-muted-dark uppercase tracking-wider">
                    {t(section.titleKey)}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.slug}>
                        <a
                          href={`${wikiBase}/wiki/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-foreground-dark transition-colors"
                        >
                          {t(item.titleKey)}
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <a
                href={`${wikiBase}/wiki/getting-started`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                <Book className="h-4 w-4" />
                {t("browseFullWiki")}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="grid gap-6 md:grid-cols-2">
              {wikiSections.map((section) => (
                <Card key={section.titleKey} className="p-6">
                  <h2 className="text-lg font-bold mb-4">{t(section.titleKey)}</h2>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.slug}>
                        <a
                          href={`${wikiBase}/wiki/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-foreground-dark transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                            {t(item.titleKey)}
                          </span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            <div className="mt-8 rounded-xl bg-primary/5 p-6 text-center">
              <h3 className="text-lg font-semibold">Lingmo Wiki</h3>
              <p className="mt-2 text-sm text-muted dark:text-muted-dark max-w-lg mx-auto">
                {t("wikiDescription")}
              </p>
              <a
                href={`${wikiBase}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open Wiki
              </a>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
