"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ end, suffix = "", prefix = "", duration, className }: AnimatedCounterProps) {
  const { ref, count } = useCountUp(end, duration);
  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}
