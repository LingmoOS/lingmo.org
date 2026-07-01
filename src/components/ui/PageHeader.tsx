"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbItem } from "./Breadcrumb";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, className }: PageHeaderProps) {
  return (
    <div className={cn("relative overflow-hidden py-20 md:py-28", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} className="mb-8" />
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">{title}</h1>
          {description && (
            <p className="mt-4 max-w-2xl text-lg text-muted dark:text-muted-dark">{description}</p>
          )}
        </motion.div>
      </div>
      <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
    </div>
  );
}
