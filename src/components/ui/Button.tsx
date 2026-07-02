"use client";

import { type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20",
        ghost: "text-foreground dark:text-foreground-dark hover:bg-black/5 dark:hover:bg-white/5",
        outline: "border border-border dark:border-border-dark text-foreground dark:text-foreground-dark hover:bg-black/5 dark:hover:bg-white/5",
        glass: "glass text-foreground dark:text-foreground-dark hover:bg-white/80 dark:hover:bg-black/80",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, children, ...props }: ButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-block"
    >
      <button className={cn(buttonVariants({ variant, size, className }))} {...props}>
        {children}
      </button>
    </motion.div>
  );
}

export { Button, buttonVariants };
