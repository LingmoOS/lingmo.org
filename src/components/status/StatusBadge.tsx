"use client";

/**
 * 状态徽章：颜色 + 图标 + 文字三重表达
 *
 * 颜色之外还有图标形状与文案，色觉障碍或黑白打印场景下同样能读出状态。
 * 只复用现有 class（与 releases 页一致的 rounded-full 徽章），不新增样式表。
 */

import type { LucideIcon } from "lucide-react";
import {
  Ban,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  MinusCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_BADGE_CLASS } from "./format";
import type { BuildStatus } from "@/types";

/** 每种归一化状态对应的图标，形状本身就是第二重区分 */
const STATUS_ICON: Record<BuildStatus, LucideIcon> = {
  success: CheckCircle2,
  failure: XCircle,
  running: Loader2,
  queued: Clock,
  cancelled: Ban,
  skipped: MinusCircle,
  unknown: HelpCircle,
};

interface StatusBadgeProps {
  status: BuildStatus;
  /** 已翻译好的状态文案 */
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const Icon = STATUS_ICON[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_BADGE_CLASS[status],
        className,
      )}
    >
      <Icon
        className={cn("h-3.5 w-3.5", status === "running" && "animate-spin")}
        aria-hidden="true"
        focusable="false"
      />
      {label}
    </span>
  );
}
