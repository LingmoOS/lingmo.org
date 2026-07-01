"use client";

import { useThemeContext } from "@/components/ui/ThemeProvider";

export function HeroSvg() {
  const { resolved } = useThemeContext();
  const isDark = resolved === "dark";
  const bg = isDark ? "#09090B" : "#FAFAFB";
  const primary = "#4F7CFF";
  const accent = "#6EE7FF";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)";
  const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "#FAFAFB" : "#09090B";
  const muted = isDark ? "#A1A1AA" : "#73737C";

  return (
    <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <rect width="800" height="600" rx="16" fill={bg} />
      {/* Title bar */}
      <rect x="0" y="0" width="800" height="36" rx="16" fill={cardBg} />
      <rect x="0" y="20" width="800" height="16" fill={cardBg} />
      <circle cx="20" cy="18" r="5" fill="#FF5F57" />
      <circle cx="36" cy="18" r="5" fill="#FFB020" />
      <circle cx="52" cy="18" r="5" fill="#27C93F" />
      {/* Desktop wallpaper */}
      <defs>
        <linearGradient id="wallpaper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={primary} stopOpacity="0.15" />
          <stop offset="50%" stopColor={accent} stopOpacity="0.1" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect x="16" y="44" width="768" height="470" rx="12" fill="url(#wallpaper)" />
      {/* File Manager Window */}
      <rect x="60" y="80" width="320" height="360" rx="12" fill={cardBg} stroke={border} strokeWidth="1" />
      <rect x="60" y="80" width="320" height="40" rx="12" fill={cardBg} />
      <rect x="60" y="100" width="320" height="20" fill={cardBg} />
      {/* Window title bar buttons */}
      <circle cx="80" cy="100" r="4" fill="#FF5F57" />
      <circle cx="92" cy="100" r="4" fill="#FFB020" />
      <circle cx="104" cy="100" r="4" fill="#27C93F" />
      {/* Folder icons in file manager */}
      <rect x="84" y="136" width="60" height="48" rx="8" fill={primary} opacity="0.3" />
      <rect x="84" y="136" width="60" height="8" rx="4" fill={primary} opacity="0.5" />
      <rect x="160" y="136" width="60" height="48" rx="8" fill={accent} opacity="0.3" />
      <rect x="160" y="136" width="60" height="8" rx="4" fill={accent} opacity="0.5" />
      <rect x="236" y="136" width="60" height="48" rx="8" fill={primary} opacity="0.2" />
      <rect x="236" y="136" width="60" height="8" rx="4" fill={primary} opacity="0.4" />
      {/* Sidebar */}
      <rect x="84" y="200" width="16" height="16" rx="4" fill={muted} opacity="0.3" />
      <text x="108" y="213" fill={muted} fontSize="11" fontFamily="system-ui">Documents</text>
      <rect x="84" y="224" width="16" height="16" rx="4" fill={muted} opacity="0.3" />
      <text x="108" y="237" fill={muted} fontSize="11" fontFamily="system-ui">Downloads</text>
      <rect x="84" y="248" width="16" height="16" rx="4" fill={muted} opacity="0.3" />
      <text x="108" y="261" fill={muted} fontSize="11" fontFamily="system-ui">Pictures</text>
      {/* Terminal Window */}
      <rect x="420" y="80" width="320" height="200" rx="12" fill={isDark ? "#1a1a2e" : "#1e1e2e"} stroke={border} strokeWidth="1" />
      <rect x="420" y="80" width="320" height="32" rx="12" fill={isDark ? "#16162a" : "#16162a"} />
      <rect x="420" y="96" width="320" height="16" fill={isDark ? "#16162a" : "#16162a"} />
      <circle cx="440" cy="96" r="4" fill="#FF5F57" />
      <circle cx="452" cy="96" r="4" fill="#FFB020" />
      <circle cx="464" cy="96" r="4" fill="#27C93F" />
      <text x="580" y="100" fill="#A1A1AA" fontSize="11" fontFamily="system-ui" textAnchor="middle">Terminal</text>
      <text x="436" y="132" fill="#6EE7FF" fontSize="12" fontFamily="monospace">$ </text>
      <text x="456" y="132" fill="#FAFAFB" fontSize="12" fontFamily="monospace">neofetch</text>
      <text x="436" y="152" fill="#FAFAFB" fontSize="11" fontFamily="monospace">OS: Lingmo OS 1.0 x86_64</text>
      <text x="436" y="168" fill="#FAFAFB" fontSize="11" fontFamily="monospace">Kernel: Linux 6.8.0-lingmo</text>
      <text x="436" y="184" fill="#FAFAFB" fontSize="11" fontFamily="monospace">DE: Lingmo Desktop</text>
      <text x="436" y="200" fill="#27C93F" fontSize="11" fontFamily="monospace">Packages: 2847 (dpkg)</text>
      {/* Settings Window */}
      <rect x="420" y="300" width="320" height="200" rx="12" fill={cardBg} stroke={border} strokeWidth="1" />
      <rect x="420" y="300" width="320" height="40" rx="12" fill={cardBg} />
      <rect x="420" y="320" width="320" height="20" fill={cardBg} />
      <text x="580" y="326" fill={text} fontSize="11" fontFamily="system-ui" textAnchor="middle">Settings</text>
      {/* Settings items */}
      <rect x="440" y="356" width="20" height="20" rx="6" fill={primary} opacity="0.2" />
      <text x="468" y="371" fill={text} fontSize="12" fontFamily="system-ui">Appearance</text>
      <rect x="440" y="388" width="20" height="20" rx="6" fill={accent} opacity="0.2" />
      <text x="468" y="403" fill={text} fontSize="12" fontFamily="system-ui">Display</text>
      <rect x="440" y="420" width="20" height="20" rx="6" fill={primary} opacity="0.2" />
      <text x="468" y="435" fill={text} fontSize="12" fontFamily="system-ui">Sound</text>
      <rect x="440" y="452" width="20" height="20" rx="6" fill="rgba(39,201,63,0.2)" />
      <text x="468" y="467" fill={text} fontSize="12" fontFamily="system-ui">Network</text>
      {/* Dock */}
      <rect x="200" y="482" width="400" height="28" rx="14" fill={cardBg} stroke={border} strokeWidth="1" />
      {/* Dock icons */}
      <rect x="224" y="486" width="20" height="20" rx="6" fill={primary} opacity="0.4" />
      <rect x="260" y="486" width="20" height="20" rx="6" fill={accent} opacity="0.4" />
      <rect x="296" y="486" width="20" height="20" rx="6" fill={muted} opacity="0.4" />
      <rect x="332" y="486" width="20" height="20" rx="6" fill={primary} opacity="0.4" />
      <rect x="392" y="486" width="20" height="20" rx="6" fill={muted} opacity="0.3" />
      <rect x="428" y="486" width="20" height="20" rx="6" fill={muted} opacity="0.3" />
      <rect x="464" y="486" width="20" height="20" rx="6" fill={muted} opacity="0.3" />
      <rect x="500" y="486" width="20" height="20" rx="6" fill={muted} opacity="0.3" />
      <rect x="536" y="486" width="20" height="20" rx="6" fill={muted} opacity="0.3" />
      {/* Active indicator */}
      <rect x="230" y="505" width="8" height="2" rx="1" fill={primary} />
    </svg>
  );
}
