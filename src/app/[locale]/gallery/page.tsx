"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/ui/PageHeader";
import { GallerySvg } from "@/components/svg/GallerySvg";
import { cn } from "@/lib/utils";

const galleryItems = [
  { id: "desktop-1", title: "Lingmo Desktop", category: "desktop" },
  { id: "settings-1", title: "Settings Panel", category: "settings" },
  { id: "terminal-1", title: "Terminal", category: "terminal" },
  { id: "store-1", title: "Software Center", category: "store" },
  { id: "dock-1", title: "Dock and App Launcher", category: "dock" },
  { id: "file-manager-1", title: "File Manager", category: "file-manager" },
  { id: "control-center-1", title: "Control Center", category: "control-center" },
  { id: "wallpaper-1", title: "Default Wallpaper", category: "wallpaper" },
  { id: "desktop-2", title: "Desktop with Apps", category: "desktop" },
  { id: "terminal-2", title: "Terminal with Neofetch", category: "terminal" },
];

const masonryLayout = [
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
];

const categories = ["all", "desktop", "settings", "terminal", "store", "dock", "file-manager", "control-center", "wallpaper"];

export default function GalleryPage() {
  const t = useTranslations("gallery");
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = activeCategory === "all"
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />

      <Section>
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm transition-colors",
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "glass hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, i) => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => setLightboxIndex(galleryItems.findIndex((g) => g.id === item.id))}
              className={cn(
                "overflow-hidden rounded-xl glass text-left transition-shadow hover:shadow-lg",
                masonryLayout[i % masonryLayout.length]
              )}
            >
              <GallerySvg category={item.category} />
              <div className="p-3">
                <p className="text-sm font-medium">{item.title}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </Section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute right-4 top-4 rounded-2xl bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>

            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                className="absolute left-4 rounded-2xl bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-hidden rounded-2xl glass">
                <GallerySvg category={galleryItems[lightboxIndex]?.category} />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white">{galleryItems[lightboxIndex]?.title}</h3>
                  <p className="mt-1 text-sm text-white/60">
                    Category: {galleryItems[lightboxIndex]?.category}
                  </p>
                </div>
              </div>
            </motion.div>

            {lightboxIndex < galleryItems.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                className="absolute right-16 rounded-2xl bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
