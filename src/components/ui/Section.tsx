"use client";

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  container?: boolean;
}

export function Section({ className, container = true, children, ...props }: SectionProps) {
  const { ref, inView } = useInView();

  return (
    <section
      ref={ref}
      className={cn(
        "py-20 md:py-28",
        container && "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </section>
  );
}

export function SectionHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-16 text-center", className)}
      {...props}
    />
  );
}

export function SectionTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl",
        className
      )}
      {...props}
    />
  );
}

export function SectionDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mt-4 text-lg text-muted dark:text-muted-dark max-w-2xl mx-auto",
        className
      )}
      {...props}
    />
  );
}
