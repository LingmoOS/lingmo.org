"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Book, ChevronRight, Search } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const docsSections = [
  {
    title: "Getting Started",
    items: [
      { title: "Installation Guide", slug: "installation" },
      { title: "System Requirements", slug: "requirements" },
      { title: "First Boot", slug: "first-boot" },
      { title: "Basic Configuration", slug: "basic-config" },
    ],
  },
  {
    title: "Desktop Environment",
    items: [
      { title: "Overview", slug: "desktop-overview" },
      { title: "Workspaces", slug: "workspaces" },
      { title: "App Launcher", slug: "app-launcher" },
      { title: "System Tray", slug: "system-tray" },
    ],
  },
  {
    title: "Applications",
    items: [
      { title: "File Manager", slug: "file-manager" },
      { title: "Terminal", slug: "terminal" },
      { title: "Settings", slug: "settings" },
      { title: "Software Center", slug: "software-center" },
    ],
  },
  {
    title: "Advanced",
    items: [
      { title: "Package Management", slug: "package-management" },
      { title: "Security", slug: "security" },
      { title: "Networking", slug: "networking" },
      { title: "Development", slug: "development" },
    ],
  },
];

export default function DocumentationPage() {
  const t = useTranslations("documentation");
  const [activeSection, setActiveSection] = useState(docsSections[0]?.items[0]?.slug || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentDoc = docsSections
    .flatMap((s) => s.items)
    .find((item) => item.slug === activeSection);

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
          <aside className={cn(
            "w-64 shrink-0 hidden lg:block",
          )}>
            <div className="sticky top-24 space-y-6">
              {docsSections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-2 text-sm font-semibold text-muted dark:text-muted-dark uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.slug}>
                        <button
                          onClick={() => setActiveSection(item.slug)}
                          className={cn(
                            "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            activeSection === item.slug
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-foreground-dark"
                          )}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed bottom-6 right-6 z-30 rounded-2xl glass p-4 shadow-lg"
          >
            <Book className="h-5 w-5" />
          </button>

          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                className="fixed left-0 top-0 h-full w-72 glass p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {docsSections.map((section) => (
                  <div key={section.title} className="mb-6">
                    <h3 className="mb-2 text-sm font-semibold text-muted dark:text-muted-dark uppercase tracking-wider">
                      {section.title}
                    </h3>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.slug}>
                          <button
                            onClick={() => { setActiveSection(item.slug); setSidebarOpen(false); }}
                            className={cn(
                              "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                              activeSection === item.slug
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                          >
                            {item.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Card glass={false} className="prose prose-sm dark:prose-invert max-w-none">
              {currentDoc ? (
                <>
                  <h1>{currentDoc.title}</h1>
                  <p className="lead text-muted dark:text-muted-dark">
                    This guide covers the basics of {currentDoc.title.toLowerCase()} in Lingmo OS.
                  </p>
                  <p>
                    Lingmo OS provides a comprehensive and intuitive experience for all users. 
                    This documentation will help you get the most out of your system.
                  </p>
                  <h2>Overview</h2>
                  <p>
                    The Lingmo Desktop Environment is designed with productivity and elegance in mind. 
                    Every element has been carefully crafted to provide a seamless user experience.
                  </p>
                  <h2>Getting Started</h2>
                  <p>
                    To begin using this feature, navigate through the system menu or use the search 
                    functionality. All settings are organized logically for quick access.
                  </p>
                  <div className="mt-8 rounded-xl bg-primary/5 p-4">
                    <p className="text-sm font-medium text-primary">
                      💡 Tip: Use the search bar at the top to quickly find documentation topics.
                    </p>
                  </div>

                  {/* Navigation */}
                  <div className="mt-12 flex items-center justify-between border-t border-border dark:border-border-dark pt-6">
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
                      Previous
                    </Button>
                    <Button variant="ghost" size="sm">
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <Book className="mx-auto h-12 w-12 text-muted dark:text-muted-dark" />
                  <p className="mt-4 text-muted dark:text-muted-dark">{t("pageDescription")}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
