"use client";

import { useThemeContext } from "@/components/ui/ThemeProvider";

interface NewsCoverSvgProps {
  title?: string;
  variant?: number;
}

export function NewsCoverSvg({ title = "Lingmo OS", variant = 1 }: NewsCoverSvgProps) {
  const { resolved } = useThemeContext();
  const isDark = resolved === "dark";

  const themes = [
    {
      grad0: "#4F7CFF",
      grad1: "#6EE7FF",
      accent: "#6EE7FF",
      tag: "RELEASE",
      id: "nc1",
    },
    {
      grad0: "#7C4FFF",
      grad1: "#FF6EE7",
      accent: "#FF6EE7",
      tag: "NEWS",
      id: "nc2",
    },
    {
      grad0: "#00B96B",
      grad1: "#4F7CFF",
      accent: "#27C93F",
      tag: "SECURITY",
      id: "nc3",
    },
  ];

  const theme = themes[(variant - 1) % themes.length] ?? themes[0];
  const fg = "#FFFFFF";
  const muted = "rgba(255,255,255,0.65)";
  const cardBg = isDark ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.18)";

  return (
    <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <linearGradient id={`${theme.id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.grad0} stopOpacity="0.92" />
          <stop offset="100%" stopColor={theme.grad1} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`${theme.id}-overlay`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.35)" />
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <radialGradient id={`${theme.id}-glow`} cx="75%" cy="30%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.12" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background gradient */}
      <rect width="800" height="400" rx="16" fill={`url(#${theme.id}-bg)`} />
      {/* Overlay for text readability */}
      <rect width="800" height="400" rx="16" fill={`url(#${theme.id}-overlay)`} />
      {/* Glow */}
      <rect width="800" height="400" rx="16" fill={`url(#${theme.id}-glow)`} />

      {/* Abstract decorative circles */}
      <circle cx="680" cy="80" r="160" fill="white" opacity="0.05" />
      <circle cx="720" cy="120" r="100" fill="white" opacity="0.05" />
      <circle cx="640" cy="300" r="120" fill={theme.accent} opacity="0.08" />
      <circle cx="750" cy="340" r="80" fill="white" opacity="0.04" />

      {/* Grid dots pattern (right side) */}
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={540 + col * 36}
            cy={60 + row * 56}
            r="2"
            fill="white"
            opacity="0.15"
          />
        ))
      )}

      {/* Horizontal rule */}
      <line x1="80" y1="200" x2="360" y2="200" stroke="white" strokeWidth="1" opacity="0.25" />

      {/* Tag pill */}
      <rect x="80" y="80" width={theme.tag.length * 10 + 24} height="26" rx="13" fill={cardBg} />
      <text
        x="92"
        y="97"
        fill={theme.accent}
        fontSize="11"
        fontFamily="system-ui"
        fontWeight="700"
        letterSpacing="2"
      >
        {theme.tag}
      </text>

      {/* Main title */}
      <text x="80" y="172" fill={fg} fontSize="40" fontWeight="800" fontFamily="system-ui">
        {title}
      </text>

      {/* Subtitle lines */}
      <rect x="80" y="212" width="260" height="10" rx="5" fill="white" opacity="0.25" />
      <rect x="80" y="232" width="200" height="10" rx="5" fill="white" opacity="0.18" />

      {/* Meta: date */}
      <text x="80" y="310" fill={muted} fontSize="13" fontFamily="system-ui">
        {variant === 1 ? "June 15, 2026" : variant === 2 ? "June 22, 2026" : "June 30, 2026"}
      </text>
      <text x="80" y="330" fill={muted} fontSize="13" fontFamily="system-ui">
        Lingmo OS Development Team
      </text>

      {/* Lingmo logo placeholder - abstract mark */}
      <circle cx="640" cy="200" r="70" fill="white" opacity="0.06" />
      <circle cx="640" cy="200" r="48" fill="white" opacity="0.06" />
      <path
        d="M618 182 Q640 162 662 182 Q680 200 662 218 Q640 238 618 218 Q600 200 618 182Z"
        fill="white"
        opacity="0.12"
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
      <text x="640" y="207" fill="white" fontSize="20" fontWeight="800" fontFamily="system-ui" textAnchor="middle" opacity="0.6">
        LOS
      </text>
    </svg>
  );
}
