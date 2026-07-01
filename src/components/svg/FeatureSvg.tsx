"use client";

import { useThemeContext } from "@/components/ui/ThemeProvider";

interface FeatureSvgProps {
  type: "performance" | "security" | "developer" | "design" | "open-source" | "community";
}

export function FeatureSvg({ type }: FeatureSvgProps) {
  const { resolved } = useThemeContext();
  const isDark = resolved === "dark";
  const primary = "#4F7CFF";
  const accent = "#6EE7FF";

  const renderIcon = () => {
    switch (type) {
      case "performance":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={primary} opacity="0.1" />
            <path d="M30 60 L50 30 L70 60 Z" fill={primary} opacity="0.6" />
            <rect x="42" y="40" width="16" height="16" rx="3" fill={isDark ? "#09090B" : "#FAFAFB"} />
          </g>
        );
      case "security":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={primary} opacity="0.1" />
            <rect x="30" y="35" width="40" height="45" rx="6" fill={primary} opacity="0.4" />
            <path d="M50 30 L35 38 L50 46 L65 38 Z" fill={accent} opacity="0.8" />
            <circle cx="50" cy="52" r="8" fill={isDark ? "#09090B" : "#FAFAFB"} />
            <path d="M47 52 L50 55 L54 49" stroke={primary} strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case "developer":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={primary} opacity="0.1" />
            <rect x="30" y="35" width="40" height="30" rx="6" fill={isDark ? "#1a1a2e" : "#1e1e2e"} />
            <text x="38" y="54" fill={accent} fontSize="12" fontFamily="monospace">{">_"} {"code"}</text>
            <path d="M35 72 L50 80 L65 72" stroke={primary} strokeWidth="2" fill="none" opacity="0.5" />
          </g>
        );
      case "design":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={primary} opacity="0.1" />
            <rect x="30" y="30" width="40" height="40" rx="8" fill={primary} opacity="0.15" />
            <rect x="35" y="35" width="12" height="12" rx="3" fill={primary} opacity="0.6" />
            <rect x="52" y="35" width="12" height="20" rx="3" fill={accent} opacity="0.5" />
            <rect x="35" y="52" width="20" height="12" rx="3" fill={accent} opacity="0.4" />
          </g>
        );
      case "open-source":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={primary} opacity="0.1" />
            <circle cx="50" cy="42" r="10" fill={primary} opacity="0.4" />
            <path d="M36 54 Q43 62 50 54 Q57 62 64 54" stroke={accent} strokeWidth="2" fill="none" />
            <circle cx="50" cy="42" r="3" fill={isDark ? "#09090B" : "#FAFAFB"} />
          </g>
        );
      case "community":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={primary} opacity="0.1" />
            <circle cx="38" cy="40" r="8" fill={primary} opacity="0.4" />
            <circle cx="62" cy="40" r="8" fill={accent} opacity="0.4" />
            <path d="M28 58 Q38 48 50 58 Q62 48 72 58" stroke={primary} strokeWidth="2" fill="none" opacity="0.5" />
          </g>
        );
    }
  };

  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16">
      {renderIcon()}
    </svg>
  );
}
