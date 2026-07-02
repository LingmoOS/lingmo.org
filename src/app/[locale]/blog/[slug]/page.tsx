"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import { mdToHtml } from "@/lib/mdToHtml";
import type { BlogPost } from "@/types";

export default function BlogDetailPage() {
  const t = useTranslations("blog");
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/content/blog.json")
      .then((r) => r.json() as Promise<BlogPost[]>)
      .then((data) => {
        setPost(data.find((p) => p.slug === slug) ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Section>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Section>
    );
  }

  if (!post) {
    return (
      <>
        <PageHeader title="" description="" breadcrumbs={[{ label: slug }]} />
        <Section>
          <div className="text-center py-20">
            <p className="text-muted dark:text-muted-dark">Post not found</p>
            <Link href="/blog">
              <Button variant="ghost" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to blog
              </Button>
            </Link>
          </div>
        </Section>
      </>
    );
  }

  const htmlContent = post.content ? mdToHtml(post.content) : "";

  return (
    <>
      <PageHeader
        title={post.title}
        description=""
        breadcrumbs={[
          { label: t("pageTitle"), href: "/blog" },
          { label: post.title },
        ]}
      />
      <Section>
        <div className="max-w-3xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("pageTitle")}
            </Button>
          </Link>

          <Card className="mt-4 p-8">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted dark:text-muted-dark">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author}
              </span>
            </div>
            {post.tags && (
              <div className="mt-3 flex items-center gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <hr className="my-6 border-border dark:border-border-dark" />
            {htmlContent ? (
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
            ) : (
              <p className="text-muted dark:text-muted-dark">{post.excerpt}</p>
            )}
          </Card>
        </div>
      </Section>
    </>
  );
}
