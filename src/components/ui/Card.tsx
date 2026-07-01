"use client";

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CardProps {
  glass?: boolean;
  hover?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className, glass = true, hover = true, children }: CardProps) {
  const baseCn = cn("rounded-xl p-6", glass && "glass", className);

  if (hover) {
    return (
      <motion.div className={baseCn} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        {children}
      </motion.div>
    );
  }

  return <div className={baseCn}>{children}</div>;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex items-center", className)} {...props} />;
}
