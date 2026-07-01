"use client";

import { useThemeContext } from "@/components/ui/ThemeProvider";

interface NewsCoverSvgProps {
  title?: string;
}

export function NewsCoverSvg({ title = "Lingmo OS" }: NewsCoverSvgProps) {
  const { resolved } = useThemeContext();
  const isDark = resolved === "dark";
  const primary = "#4F7CFF";

  return (
    <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <linearGradient id="news-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={primary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="800" height="400" rx="16" fill="url(#news-gradient)" />
      <circle cx="650" cy="100" r="120" fill={primary} opacity="0.08" />
      <circle cx="150" cy="300" r="80" fill={primary} opacity="0.06" />
      <rect x="100" y="120" width="400" height="12" rx="6" fill={primary} opacity="0.15" />
      <rect x="100" y="150" width="300" height="12" rx="6" fill={primary} opacity="0.1" />
      <rect x="100" y="180" width="350" height="12" rx="6" fill={primary} opacity="0.08" />
      <text x="100" y="260" fill={isDark ? "#FAFAFB" : "#09090B"} fontSize="32" fontWeight="700" fontFamily="system-ui">
        {title}
      </text>
      <rect x="100" y="290" width="200" height="6" rx="3" fill={primary} opacity="0.2" />
    </svg>
  );
}
