"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import { mdToHtml } from "@/lib/mdToHtml";
import { cn } from "@/lib/utils";
import type { ReleaseNote } from "@/types";

export default function ReleaseDetailPage() {
  const t = useTranslations("releases");
  const params = useParams();

  const version = params.version as string;
  const [release, setRelease] = useState<ReleaseNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/content/releases.json")
      .then((res) => res.json() as Promise<ReleaseNote[]>)
      .then((data) => {
        const found = data.find((r) => r.version === version);
        setRelease(found ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [version]);

  if (loading) {
    return (
      <Section>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Section>
    );
  }

  if (!release) {
    return (
      <>
        <PageHeader
          title={t("pageTitle")}
          description=""
          breadcrumbs={[
            { label: t("pageTitle"), href: `/releases` },
            { label: version },
          ]}
        />
        <Section>
          <div className="text-center py-20">
            <p className="text-muted dark:text-muted-dark">Release not found</p>
            <Link href={`/releases`}>
              <Button variant="ghost" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to releases
              </Button>
            </Link>
          </div>
        </Section>
      </>
    );
  }

  const htmlContent = mdToHtml(release.content);

  return (
    <>
      <PageHeader
        title={release.version}
        description={release.title}
        breadcrumbs={[
            { label: t("pageTitle"), href: `/releases` },
            { label: release.version },
        ]}
      />
      <Section>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Link href={`/releases`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("pageTitle")}
              </Button>
            </Link>
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              release.type === "stable" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
            )}>
              {release.type}
            </span>
          </div>

          <Card className="p-8">
            <h1 className="text-3xl font-bold">{release.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted dark:text-muted-dark">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {release.date}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {release.version}
              </span>
            </div>
            <hr className="my-6 border-border dark:border-border-dark" />
            <div
              className="prose prose-neutral dark:prose-invert max-w-none
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4
                [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3
                [&_p]:leading-relaxed [&_p]:mb-4
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                [&_li]:mb-1
                [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </Card>

          <div className="mt-6 text-center">
            <Link href={`/download`}>
              <Button variant="primary">
                Download Lingmo OS {release.version}
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
