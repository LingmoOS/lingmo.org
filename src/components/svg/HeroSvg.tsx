"use client";

import { useThemeContext } from "@/components/ui/ThemeProvider";

export function HeroSvg() {
  const { resolved } = useThemeContext();
  const isDark = resolved === "dark";

  const wallGrad0 = isDark ? "#0D102A" : "#E8EDFF";
  const wallGrad1 = isDark ? "#0A1428" : "#EAF4FF";
  const primary = "#4F7CFF";
  const accent = "#6EE7FF";
  const green = "#27C93F";
  const orange = "#FF9500";
  const red = "#FF5F57";
  const yellow = "#FFB020";
  const panel = isDark ? "rgba(14,14,30,0.96)" : "rgba(235,240,255,0.97)";
  const win = isDark ? "rgba(16,16,32,0.92)" : "rgba(252,253,255,0.95)";
  const winBar = isDark ? "rgba(20,20,40,0.98)" : "rgba(240,244,255,0.98)";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(60,80,180,0.12)";
  const fg = isDark ? "#E8E8F4" : "#1A1A2E";
  const muted = isDark ? "#7070A0" : "#6060A0";
  const term = isDark ? "#0C0C1A" : "#0F0F1E";
  const termBar = isDark ? "#161626" : "#181828";
  const sidebar = isDark ? "rgba(255,255,255,0.03)" : "rgba(60,80,180,0.03)";

  return (
    <svg viewBox="0 0 800 560" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto rounded-2xl">
      <defs>
        <linearGradient id="hero-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={wallGrad0} />
          <stop offset="60%" stopColor={isDark ? "#0C1630" : "#EDF2FF"} />
          <stop offset="100%" stopColor={wallGrad1} />
        </linearGradient>
        <linearGradient id="hero-dock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.88)"} />
          <stop offset="100%" stopColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.70)"} />
        </linearGradient>
        <radialGradient id="hero-glow1" cx="70%" cy="30%" r="40%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.07" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-glow2" cx="20%" cy="75%" r="35%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.05" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Desktop background */}
      <rect width="800" height="560" rx="16" fill="url(#hero-wall)" />
      <rect width="800" height="560" rx="16" fill="url(#hero-glow1)" />
      <rect width="800" height="560" rx="16" fill="url(#hero-glow2)" />

      {/* Decorative background circles */}
      <circle cx="680" cy="160" r="160" fill={primary} opacity="0.03" />
      <circle cx="120" cy="440" r="120" fill={accent} opacity="0.03" />

      {/* ===== TOP PANEL ===== */}
      <rect x="0" y="0" width="800" height="32" fill={panel} />
      <line x1="0" y1="32" x2="800" y2="32" stroke={border} strokeWidth="1" />
      {/* Panel: App launcher */}
      <rect x="6" y="4" width="70" height="24" rx="5" fill={primary} opacity="0.12" />
      <circle cx="18" cy="16" r="4.5" fill={primary} opacity="0.7" />
      <rect x="26" y="13" width="36" height="2.5" rx="1.25" fill={fg} opacity="0.45" />
      <rect x="26" y="17.5" width="28" height="2.5" rx="1.25" fill={fg} opacity="0.3" />
      {/* Panel: Active app label */}
      <text x="400" y="20" fill={fg} fontSize="11" fontFamily="system-ui" textAnchor="middle" opacity="0.7">Files — Home</text>
      {/* Panel: Clock */}
      <text x="752" y="20" fill={fg} fontSize="11" fontFamily="system-ui" textAnchor="middle" opacity="0.8">17:04</text>
      {/* Panel: Tray icons */}
      <g opacity="0.5">
        <path d="M706 12 Q710 8 714 12" stroke={fg} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M704 15 Q710 9 716 15" stroke={fg} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="710" cy="20" r="1.5" fill={fg} />
        <rect x="720" y="12" width="6" height="10" rx="1" fill={fg} opacity="0.6" />
        <path d="M726 14 Q730 17 726 20" stroke={fg} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="734" y="11" width="14" height="10" rx="2" stroke={fg} strokeWidth="1.2" fill="none" />
        <rect x="748" y="14" width="2" height="4" rx="1" fill={fg} />
        <rect x="735.5" y="12.5" width="10" height="7" rx="1" fill={fg} opacity="0.4" />
      </g>

      {/* ===== FILE MANAGER WINDOW ===== */}
      <rect x="20" y="44" width="460" height="396" rx="12" fill={win} stroke={border} strokeWidth="1" />
      {/* FM Titlebar */}
      <rect x="20" y="44" width="460" height="36" rx="12" fill={winBar} />
      <rect x="20" y="68" width="460" height="12" fill={winBar} />
      <circle cx="38" cy="62" r="5" fill={red} />
      <circle cx="52" cy="62" r="5" fill={yellow} />
      <circle cx="66" cy="62" r="5" fill={green} />
      <text x="250" y="66" fill={fg} fontSize="11" fontFamily="system-ui" textAnchor="middle" opacity="0.65">Files — Home</text>

      {/* FM Toolbar */}
      <rect x="20" y="80" width="460" height="32" fill={isDark ? "rgba(0,0,0,0.15)" : "rgba(60,80,180,0.03)"} />
      <path d="M32 90 L28 96 L32 102" stroke={fg} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      <path d="M40 90 L44 96 L40 102" stroke={fg} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      <rect x="52" y="88" width="160" height="16" rx="8" fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(60,80,180,0.05)"} />
      <text x="60" y="100" fill={muted} fontSize="9" fontFamily="system-ui">Home / user</text>
      <rect x="448" y="88" width="28" height="16" rx="4" fill={primary} opacity="0.12" />

      {/* FM Sidebar */}
      <rect x="20" y="112" width="110" height="328" fill={sidebar} />
      <line x1="130" y1="112" x2="130" y2="440" stroke={border} strokeWidth="0.5" />
      <text x="28" y="128" fill={muted} fontSize="8" fontFamily="system-ui" fontWeight="600" opacity="0.8">PLACES</text>
      {[
        { name: "Home", active: true },
        { name: "Desktop", active: false },
        { name: "Documents", active: false },
        { name: "Downloads", active: false },
        { name: "Music", active: false },
        { name: "Pictures", active: false },
        { name: "Videos", active: false },
      ].map(({ name, active }, i) => (
        <g key={name}>
          {active && <rect x="20" y={134 + i * 22} width="110" height="20" fill={primary} opacity="0.1" />}
          <rect x="28" y={138 + i * 22} width="11" height="11" rx="2.5" fill={active ? primary : muted} opacity={active ? 0.6 : 0.2} />
          <text x="44" y={148 + i * 22} fill={active ? primary : muted} fontSize="9.5" fontFamily="system-ui" opacity={active ? 1 : 0.7}>{name}</text>
        </g>
      ))}
      {/* Devices section */}
      <text x="28" y="298" fill={muted} fontSize="8" fontFamily="system-ui" fontWeight="600" opacity="0.8">DEVICES</text>
      <rect x="28" y="302" width="11" height="11" rx="2.5" fill={muted} opacity="0.2" />
      <text x="44" y="312" fill={muted} fontSize="9.5" fontFamily="system-ui" opacity="0.6">System (89%)</text>
      <rect x="28" y="316" width="80" height="4" rx="2" fill={muted} opacity="0.1" />
      <rect x="28" y="316" width="71" height="4" rx="2" fill={primary} opacity="0.3" />

      {/* FM Main area: folder row 1 */}
      {["Desktop", "Documents", "Downloads", "Music"].map((name, i) => (
        <g key={name} transform={`translate(${148 + i * 76}, 124)`}>
          <rect x="0" y="0" width="62" height="54" rx="8" fill={primary} opacity="0.09" />
          <rect x="0" y="0" width="62" height="8" rx="4" fill={primary} opacity="0.22" />
          <rect x="14" y="12" width="34" height="28" rx="4" fill={primary} opacity="0.12" />
          <text x="31" y="48" fill={muted} fontSize="8" fontFamily="system-ui" textAnchor="middle">{name}</text>
        </g>
      ))}
      {/* Folder row 2 */}
      {["Pictures", "Videos", "Projects", "Trash"].map((name, i) => (
        <g key={name} transform={`translate(${148 + i * 76}, 194)`}>
          <rect x="0" y="0" width="62" height="54" rx="8" fill={accent} opacity="0.07" />
          <rect x="0" y="0" width="62" height="8" rx="4" fill={accent} opacity="0.18" />
          <rect x="14" y="12" width="34" height="28" rx="4" fill={accent} opacity="0.1" />
          <text x="31" y="48" fill={muted} fontSize="8" fontFamily="system-ui" textAnchor="middle">{name}</text>
        </g>
      ))}
      {/* File row 3 */}
      {[
        { name: "report.pdf", color: red, op: 0.4 },
        { name: "photo.jpg", color: primary, op: 0.35 },
        { name: "notes.md", color: primary, op: 0.3 },
        { name: "script.py", color: accent, op: 0.35 },
      ].map(({ name, color, op }, i) => (
        <g key={name} transform={`translate(${148 + i * 76}, 264)`}>
          <rect x="0" y="0" width="62" height="54" rx="8" fill={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"} />
          <rect x="16" y="8" width="30" height="36" rx="3" fill={color} opacity={op} />
          <rect x="34" y="8" width="12" height="12" rx="2" fill={color} opacity={op * 0.6} />
          <text x="31" y="50" fill={muted} fontSize="8" fontFamily="system-ui" textAnchor="middle">{name}</text>
        </g>
      ))}

      {/* FM Status bar */}
      <rect x="20" y="410" width="460" height="30" fill={isDark ? "rgba(0,0,0,0.15)" : "rgba(60,80,180,0.03)"} />
      <line x1="20" y1="410" x2="480" y2="410" stroke={border} strokeWidth="0.5" />
      <text x="30" y="427" fill={muted} fontSize="9" fontFamily="system-ui">15 items — 3 hidden</text>

      {/* ===== TERMINAL WINDOW ===== */}
      <rect x="320" y="210" width="460" height="310" rx="12" fill={term} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <rect x="320" y="210" width="460" height="36" rx="12" fill={termBar} />
      <rect x="320" y="234" width="460" height="12" fill={termBar} />
      <circle cx="340" cy="228" r="5" fill={red} />
      <circle cx="354" cy="228" r="5" fill={yellow} />
      <circle cx="368" cy="228" r="5" fill={green} />
      <text x="550" y="232" fill="#7070A0" fontSize="11" fontFamily="system-ui" textAnchor="middle">Terminal</text>

      {/* Terminal prompt 1 */}
      <text x="336" y="264" fill="#6080FF" fontSize="10.5" fontFamily="monospace">user</text>
      <text x="362" y="264" fill="#8080A0" fontSize="10.5" fontFamily="monospace">@</text>
      <text x="372" y="264" fill={green} fontSize="10.5" fontFamily="monospace">lingmo</text>
      <text x="412" y="264" fill="#8080A0" fontSize="10.5" fontFamily="monospace">:~$</text>
      <text x="436" y="264" fill="#E8E8F4" fontSize="10.5" fontFamily="monospace">neofetch</text>

      {/* neofetch output */}
      <text x="336" y="284" fill={accent} fontSize="9.5" fontFamily="monospace">OS:</text>
      <text x="360" y="284" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">Lingmo OS 3.0.5 x86_64</text>
      <text x="336" y="300" fill={accent} fontSize="9.5" fontFamily="monospace">Kernel:</text>
      <text x="386" y="300" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">6.8.0-lingmo</text>
      <text x="336" y="316" fill={accent} fontSize="9.5" fontFamily="monospace">DE:</text>
      <text x="360" y="316" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">Lingmo Shell 3.0</text>
      <text x="336" y="332" fill={accent} fontSize="9.5" fontFamily="monospace">WM:</text>
      <text x="360" y="332" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">KWin (Wayland)</text>
      <text x="336" y="348" fill={accent} fontSize="9.5" fontFamily="monospace">CPU:</text>
      <text x="360" y="348" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">Intel Core i7 @ 3.60GHz</text>
      <text x="336" y="364" fill={accent} fontSize="9.5" fontFamily="monospace">RAM:</text>
      <text x="360" y="364" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">3.2GiB / 16.0 GiB</text>
      <text x="336" y="380" fill={green} fontSize="9.5" fontFamily="monospace">Packages:</text>
      <text x="400" y="380" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">2847 (dpkg)</text>

      {/* Terminal prompt 2 */}
      <text x="336" y="404" fill="#6080FF" fontSize="10.5" fontFamily="monospace">user</text>
      <text x="362" y="404" fill="#8080A0" fontSize="10.5" fontFamily="monospace">@</text>
      <text x="372" y="404" fill={green} fontSize="10.5" fontFamily="monospace">lingmo</text>
      <text x="412" y="404" fill="#8080A0" fontSize="10.5" fontFamily="monospace">:~$</text>
      <text x="436" y="404" fill="#E8E8F4" fontSize="10.5" fontFamily="monospace">sudo apt upgrade -y</text>

      {/* apt output */}
      <text x="336" y="422" fill={green} fontSize="9.5" fontFamily="monospace">Reading package lists... Done</text>
      <text x="336" y="438" fill={green} fontSize="9.5" fontFamily="monospace">Building dependency tree... Done</text>
      <text x="336" y="454" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">0 upgraded, 0 newly installed.</text>

      {/* Blinking cursor */}
      <text x="336" y="472" fill="#6080FF" fontSize="10.5" fontFamily="monospace">user@lingmo:~$</text>
      <rect x="438" y="461" width="7" height="13" rx="1" fill="#D0D0E8" opacity="0.75" />

      {/* ===== DOCK ===== */}
      <rect x="216" y="510" width="368" height="40" rx="20" fill="url(#hero-dock)" stroke={border} strokeWidth="1" />
      {/* Dock icons */}
      {[
        { color: primary, op: 0.55, active: true },
        { color: accent, op: 0.45, active: false },
        { color: primary, op: 0.4, active: false },
        { color: green, op: 0.4, active: false },
        { color: orange, op: 0.4, active: false },
        { color: primary, op: 0.35, active: false },
        { color: accent, op: 0.3, active: false },
        { color: muted, op: 0.3, active: false },
        { color: muted, op: 0.25, active: false },
      ].map(({ color, op, active }, i) => (
        <g key={i}>
          <rect x={234 + i * 36} y="518" width="26" height="26" rx="7" fill={color} opacity={op} />
          {active && <rect x={242 + i * 36} y="543" width="10" height="3" rx="1.5" fill={color} opacity="0.8" />}
        </g>
      ))}
    </svg>
  );
}
