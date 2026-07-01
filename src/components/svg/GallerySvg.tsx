"use client";

import { useThemeContext } from "@/components/ui/ThemeProvider";

interface GallerySvgProps {
  category?: string;
}

export function GallerySvg({ category = "desktop" }: GallerySvgProps) {
  const { resolved } = useThemeContext();
  const isDark = resolved === "dark";
  const bg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";

  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <rect width="400" height="300" rx="12" fill={bg} />
      {category === "desktop" && (
        <g>
          <rect x="40" y="40" width="320" height="200" rx="8" fill="#4F7CFF" opacity="0.1" />
          <rect x="60" y="60" width="140" height="100" rx="6" fill="#4F7CFF" opacity="0.15" />
          <rect x="210" y="60" width="130" height="60" rx="6" fill="#6EE7FF" opacity="0.15" />
          <rect x="60" y="170" width="280" height="40" rx="6" fill="#4F7CFF" opacity="0.08" />
          <circle cx="400" cy="260" r="20" fill="#4F7CFF" opacity="0.1" />
          <circle cx="370" cy="270" r="12" fill="#6EE7FF" opacity="0.1" />
        </g>
      )}
      {category === "settings" && (
        <g>
          <rect x="60" y="50" width="280" height="200" rx="10" fill="#4F7CFF" opacity="0.08" />
          <rect x="80" y="70" width="240" height="30" rx="6" fill="#4F7CFF" opacity="0.12" />
          <rect x="80" y="115" width="100" height="20" rx="4" fill="#6EE7FF" opacity="0.2" />
          <rect x="80" y="145" width="100" height="20" rx="4" fill="#4F7CFF" opacity="0.15" />
          <rect x="80" y="175" width="100" height="20" rx="4" fill="#6EE7FF" opacity="0.15" />
        </g>
      )}
      {category === "terminal" && (
        <g>
          <rect x="50" y="60" width="300" height="180" rx="8" fill={isDark ? "#1a1a2e" : "#1e1e2e"} />
          <rect x="50" y="60" width="300" height="28" rx="8" fill={isDark ? "#16162a" : "#16162a"} />
          <rect x="50" y="76" width="300" height="12" fill={isDark ? "#16162a" : "#16162a"} />
          <circle cx="68" cy="74" r="4" fill="#FF5F57" />
          <circle cx="80" cy="74" r="4" fill="#FFB020" />
          <circle cx="92" cy="74" r="4" fill="#27C93F" />
          <text x="200" y="78" fill="#A1A1AA" fontSize="10" fontFamily="system-ui" textAnchor="middle">Terminal</text>
          <text x="70" y="106" fill="#6EE7FF" fontSize="11" fontFamily="monospace">$ uname -a</text>
          <text x="70" y="126" fill="#FAFAFB" fontSize="10" fontFamily="monospace">Linux lingmo 6.8.0 #1 SMP</text>
          <text x="70" y="146" fill="#FAFAFB" fontSize="10" fontFamily="monospace">x86_64 GNU/Linux</text>
          <text x="70" y="170" fill="#6EE7FF" fontSize="11" fontFamily="monospace">$ list installed</text>
          <text x="70" y="190" fill="#FAFAFB" fontSize="10" fontFamily="monospace">2847 packages</text>
          <text x="70" y="210" fill="#6EE7FF" fontSize="11" fontFamily="monospace">$ _</text>
        </g>
      )}
      {category === "store" && (
        <g>
          <rect x="50" y="50" width="300" height="200" rx="10" fill="#4F7CFF" opacity="0.08" />
          <rect x="70" y="70" width="120" height="16" rx="4" fill="#4F7CFF" opacity="0.2" />
          <rect x="70" y="96" width="80" height="80" rx="10" fill="#4F7CFF" opacity="0.12" />
          <rect x="162" y="96" width="80" height="80" rx="10" fill="#6EE7FF" opacity="0.12" />
          <rect x="254" y="96" width="80" height="80" rx="10" fill="#4F7CFF" opacity="0.08" />
          <rect x="70" y="186" width="260" height="40" rx="6" fill="#4F7CFF" opacity="0.06" />
        </g>
      )}
      {category === "dock" && (
        <g>
          <rect x="40" y="180" width="320" height="24" rx="12" fill="#4F7CFF" opacity="0.08" />
          <rect x="56" y="184" width="16" height="16" rx="4" fill="#4F7CFF" opacity="0.3" />
          <rect x="84" y="184" width="16" height="16" rx="4" fill="#6EE7FF" opacity="0.3" />
          <rect x="112" y="184" width="16" height="16" rx="4" fill="#4F7CFF" opacity="0.3" />
          <rect x="140" y="184" width="16" height="16" rx="4" fill="#4F7CFF" opacity="0.2" />
          <rect x="168" y="184" width="16" height="16" rx="4" fill="#4F7CFF" opacity="0.2" />
          <rect x="210" y="184" width="16" height="16" rx="4" fill="#6EE7FF" opacity="0.2" />
          <rect x="238" y="184" width="16" height="16" rx="4" fill="#4F7CFF" opacity="0.2" />
          <rect x="266" y="184" width="16" height="16" rx="4" fill="#4F7CFF" opacity="0.2" />
          <rect x="294" y="184" width="16" height="16" rx="4" fill="#4F7CFF" opacity="0.2" />
          <rect x="322" y="184" width="16" height="16" rx="4" fill="#4F7CFF" opacity="0.2" />
        </g>
      )}
      {category === "file-manager" && (
        <g>
          <rect x="40" y="60" width="320" height="200" rx="10" fill="#4F7CFF" opacity="0.06" />
          <rect x="40" y="60" width="320" height="32" rx="10" fill="#4F7CFF" opacity="0.1" />
          <rect x="40" y="80" width="320" height="12" fill="#4F7CFF" opacity="0.1" />
          <circle cx="58" cy="76" r="4" fill="#FF5F57" />
          <circle cx="70" cy="76" r="4" fill="#FFB020" />
          <circle cx="82" cy="76" r="4" fill="#27C93F" />
          <rect x="60" y="106" width="50" height="40" rx="6" fill="#4F7CFF" opacity="0.2" />
          <rect x="60" y="106" width="50" height="6" rx="3" fill="#4F7CFF" opacity="0.4" />
          <rect x="122" y="106" width="50" height="40" rx="6" fill="#6EE7FF" opacity="0.2" />
          <rect x="122" y="106" width="50" height="6" rx="3" fill="#6EE7FF" opacity="0.4" />
          <rect x="184" y="106" width="50" height="40" rx="6" fill="#4F7CFF" opacity="0.15" />
          <rect x="184" y="106" width="50" height="6" rx="3" fill="#4F7CFF" opacity="0.3" />
          <rect x="60" y="160" width="280" height="12" rx="3" fill="#4F7CFF" opacity="0.08" />
          <rect x="60" y="180" width="200" height="12" rx="3" fill="#4F7CFF" opacity="0.06" />
          <rect x="60" y="200" width="240" height="12" rx="3" fill="#4F7CFF" opacity="0.08" />
          <rect x="60" y="220" width="160" height="12" rx="3" fill="#4F7CFF" opacity="0.06" />
        </g>
      )}
      {category === "control-center" && (
        <g>
          <rect x="100" y="50" width="200" height="220" rx="12" fill="#4F7CFF" opacity="0.06" />
          <rect x="120" y="70" width="160" height="20" rx="4" fill="#4F7CFF" opacity="0.12" />
          <rect x="120" y="100" width="160" height="8" rx="4" fill="#6EE7FF" opacity="0.3" />
          <rect x="120" y="118" width="12" height="12" rx="3" fill="#4F7CFF" opacity="0.4" />
          <rect x="140" y="120" width="60" height="8" rx="3" fill="#4F7CFF" opacity="0.2" />
          <rect x="120" y="140" width="12" height="12" rx="3" fill="#6EE7FF" opacity="0.4" />
          <rect x="140" y="142" width="60" height="8" rx="3" fill="#4F7CFF" opacity="0.2" />
          <rect x="120" y="162" width="12" height="12" rx="3" fill="#4F7CFF" opacity="0.3" />
          <rect x="140" y="164" width="60" height="8" rx="3" fill="#4F7CFF" opacity="0.2" />
          <rect x="120" y="200" width="160" height="40" rx="8" fill="#4F7CFF" opacity="0.1" />
        </g>
      )}
      {category === "wallpaper" && (
        <g>
          <defs>
            <linearGradient id="wallpaper-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4F7CFF" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#6EE7FF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4F7CFF" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" rx="12" fill="url(#wallpaper-gradient)" />
          <circle cx="200" cy="150" r="80" fill="#4F7CFF" opacity="0.1" />
          <circle cx="160" cy="120" r="40" fill="#6EE7FF" opacity="0.1" />
          <circle cx="240" cy="180" r="50" fill="#4F7CFF" opacity="0.08" />
          <circle cx="200" cy="150" r="20" fill="#4F7CFF" opacity="0.15" />
        </g>
      )}
    </svg>
  );
}
