"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  current: number;
  total: number;
  onPage: (page: number) => void;
  className?: string;
}

export function Pagination({ current, total, onPage, className }: PaginationProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        onClick={() => onPage(current - 1)}
        disabled={current <= 1}
        className="rounded-xl glass px-3 py-2 text-sm disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPage(page)}
          className={cn(
            "rounded-xl px-3 py-2 text-sm transition-colors",
            page === current
              ? "bg-primary text-white"
              : "glass hover:bg-black/5 dark:hover:bg-white/5"
          )}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPage(current + 1)}
        disabled={current >= total}
        className="rounded-xl glass px-3 py-2 text-sm disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
