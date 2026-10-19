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
  const green = "#27C93F";

  const renderIcon = () => {
    switch (type) {
      case "performance":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={primary} opacity="0.1" />
            {/* Speedometer arc background */}
            <path d="M20 60 A30 30 0 0 1 80 60" stroke={primary} strokeWidth="3.5" fill="none" opacity="0.18" strokeLinecap="round" />
            {/* Speedometer arc fill (fast) */}
            <path d="M20 60 A30 30 0 0 1 65 30" stroke={primary} strokeWidth="3.5" fill="none" opacity="0.7" strokeLinecap="round" />
            {/* Tick marks */}
            <line x1="20" y1="60" x2="24" y2="55" stroke={primary} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <line x1="50" y1="20" x2="50" y2="25" stroke={primary} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <line x1="80" y1="60" x2="76" y2="55" stroke={primary} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <line x1="35" y1="25" x2="37.5" y2="29" stroke={primary} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            <line x1="65" y1="25" x2="62.5" y2="29" stroke={primary} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            {/* Needle */}
            <line x1="50" y1="50" x2="28" y2="38" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
            {/* Center dot */}
            <circle cx="50" cy="50" r="4.5" fill={primary} opacity="0.85" />
            <circle cx="50" cy="50" r="2" fill="white" opacity="0.5" />
          </g>
        );

      case "security":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={primary} opacity="0.1" />
            {/* Shield body */}
            <path
              d="M50 18 L72 27 L72 49 Q72 66 50 76 Q28 66 28 49 L28 27 Z"
              fill={primary}
              opacity="0.18"
              stroke={primary}
              strokeWidth="1.5"
            />
            {/* Shield inner */}
            <path
              d="M50 23 L68 31 L68 49 Q68 63 50 71 Q32 63 32 49 L32 31 Z"
              fill={primary}
              opacity="0.12"
            />
            {/* Checkmark */}
            <path
              d="M38 49 L46 57 L62 40"
              stroke={accent}
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );

      case "developer":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={primary} opacity="0.1" />
            {/* Terminal window */}
            <rect x="22" y="28" width="56" height="44" rx="8" fill={isDark ? "#0F0F1E" : "#1A1A2E"} />
            {/* Title bar */}
            <rect x="22" y="28" width="56" height="14" rx="8" fill={isDark ? "#161626" : "#16162A"} />
            <rect x="22" y="35" width="56" height="7" fill={isDark ? "#161626" : "#16162A"} />
            {/* Traffic lights */}
            <circle cx="30" cy="35" r="2.5" fill="#FF5F57" />
            <circle cx="37" cy="35" r="2.5" fill="#FFB020" />
            <circle cx="44" cy="35" r="2.5" fill={green} />
            {/* Code: < / > */}
            <path d="M28 54 L34 50 L28 46" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M72 54 L66 50 L72 46" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="55" y1="44" x2="45" y2="56" stroke={primary} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          </g>
        );

      case "design":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={primary} opacity="0.1" />
            {/* Pen/stylus body */}
            <path d="M38 68 L32 76 L40 74 Z" fill={primary} opacity="0.5" />
            <path
              d="M40 66 L62 36 Q65 32 68 35 Q71 38 68 41 L46 68 Z"
              fill={primary}
              opacity="0.25"
              stroke={primary}
              strokeWidth="1.2"
            />
            <path
              d="M46 68 L68 41 Q71 38 68 35"
              stroke={primary}
              strokeWidth="0.5"
              fill="none"
              opacity="0.4"
            />
            {/* Color swatches */}
            <circle cx="58" cy="64" r="5" fill={primary} opacity="0.55" />
            <circle cx="68" cy="60" r="5" fill={accent} opacity="0.55" />
            <circle cx="64" cy="72" r="5" fill="#B47FFF" opacity="0.55" />
            {/* Nib */}
            <path d="M37 68 L32 76 L40 74 Z" fill={accent} opacity="0.6" />
          </g>
        );

      case "open-source":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={primary} opacity="0.1" />
            {/* Circular arrows */}
            <path
              d="M26 50 A24 24 0 0 1 63 29"
              stroke={primary}
              strokeWidth="3"
              fill="none"
              opacity="0.65"
              strokeLinecap="round"
            />
            <path
              d="M74 50 A24 24 0 0 1 37 71"
              stroke={accent}
              strokeWidth="3"
              fill="none"
              opacity="0.65"
              strokeLinecap="round"
            />
            {/* Arrow heads */}
            <path d="M60 25 L63 29 L58 31" stroke={primary} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 75 L37 71 L42 69" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Center icon: open book */}
            <circle cx="50" cy="50" r="7" fill={primary} opacity="0.15" stroke={primary} strokeWidth="1.2" />
            <circle cx="50" cy="50" r="2.5" fill={primary} opacity="0.6" />
          </g>
        );

      case "community":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill={primary} opacity="0.1" />
            {/* Left person */}
            <circle cx="33" cy="38" r="7.5" fill={primary} opacity="0.35" />
            <path d="M18 62 Q33 51 48 60" stroke={primary} strokeWidth="2" fill="none" opacity="0.35" strokeLinecap="round" />
            {/* Right person */}
            <circle cx="67" cy="38" r="7.5" fill={accent} opacity="0.35" />
            <path d="M52 60 Q67 51 82 62" stroke={accent} strokeWidth="2" fill="none" opacity="0.35" strokeLinecap="round" />
            {/* Center person (highlighted / foreground) */}
            <circle cx="50" cy="36" r="9" fill={primary} opacity="0.55" />
            <path d="M29 63 Q50 50 71 63" stroke={primary} strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round" />
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
