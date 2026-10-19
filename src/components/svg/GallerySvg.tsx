"use client";

import { useThemeContext } from "@/components/ui/ThemeProvider";

interface GallerySvgProps {
  category?: string;
}

export function GallerySvg({ category = "desktop" }: GallerySvgProps) {
  const { resolved } = useThemeContext();
  const isDark = resolved === "dark";
  const primary = "#4F7CFF";
  const accent = "#6EE7FF";
  const green = "#27C93F";
  const red = "#FF5F57";
  const yellow = "#FFB020";
  const bg = isDark ? "#0A0A18" : "#EDF0FA";
  const panel = isDark ? "rgba(14,14,30,0.97)" : "rgba(230,235,255,0.97)";
  const win = isDark ? "rgba(16,16,32,0.94)" : "rgba(250,252,255,0.97)";
  const winBar = isDark ? "rgba(20,20,42,0.98)" : "rgba(235,240,255,0.98)";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(60,80,180,0.1)";
  const fg = isDark ? "#E8E8F4" : "#1A1A2E";
  const muted = isDark ? "#7070A0" : "#6060A0";
  const term = "#0C0C1A";
  const termBar = "#161626";
  const sidebar = isDark ? "rgba(255,255,255,0.03)" : "rgba(60,80,180,0.03)";

  if (category === "desktop") {
    return (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <defs>
          <linearGradient id="gal-desk-wall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={isDark ? "#0D102A" : "#E8EDFF"} />
            <stop offset="100%" stopColor={isDark ? "#0A1428" : "#EAF4FF"} />
          </linearGradient>
        </defs>
        {/* Wallpaper */}
        <rect width="400" height="300" rx="12" fill="url(#gal-desk-wall)" />
        <circle cx="340" cy="80" r="90" fill={primary} opacity="0.04" />
        <circle cx="60" cy="240" r="70" fill={accent} opacity="0.04" />

        {/* Top panel */}
        <rect x="0" y="0" width="400" height="20" fill={panel} />
        <line x1="0" y1="20" x2="400" y2="20" stroke={border} strokeWidth="0.5" />
        <rect x="4" y="4" width="36" height="12" rx="3" fill={primary} opacity="0.12" />
        <circle cx="10" cy="10" r="3" fill={primary} opacity="0.6" />
        <text x="380" y="13" fill={fg} fontSize="7" fontFamily="system-ui" textAnchor="middle" opacity="0.7">17:04</text>

        {/* Window: file manager */}
        <rect x="14" y="28" width="200" height="180" rx="8" fill={win} stroke={border} strokeWidth="0.5" />
        <rect x="14" y="28" width="200" height="22" rx="8" fill={winBar} />
        <rect x="14" y="40" width="200" height="10" fill={winBar} />
        <circle cx="24" cy="39" r="3" fill={red} />
        <circle cx="32" cy="39" r="3" fill={yellow} />
        <circle cx="40" cy="39" r="3" fill={green} />
        <text x="114" y="42" fill={fg} fontSize="7" fontFamily="system-ui" textAnchor="middle" opacity="0.6">Files</text>
        {/* Sidebar */}
        <rect x="14" y="50" width="48" height="158" fill={sidebar} />
        <line x1="62" y1="50" x2="62" y2="208" stroke={border} strokeWidth="0.5" />
        {["Home","Docs","Downloads","Music","Pictures"].map((n, i) => (
          <g key={n}>
            {i === 0 && <rect x="14" y={56 + i * 22} width="48" height="18" fill={primary} opacity="0.1" />}
            <rect x="18" y={60 + i * 22} width="8" height="8" rx="2" fill={i === 0 ? primary : muted} opacity={i === 0 ? 0.6 : 0.2} />
            <text x="30" y={68 + i * 22} fill={i === 0 ? primary : muted} fontSize="6" fontFamily="system-ui" opacity="0.85">{n}</text>
          </g>
        ))}
        {/* Main area folders */}
        {["Desktop","Documents","Downloads","Music"].map((n, i) => (
          <g key={n} transform={`translate(${72 + i * 36}, 58)`}>
            <rect x="0" y="0" width="30" height="26" rx="4" fill={primary} opacity="0.1" />
            <rect x="0" y="0" width="30" height="5" rx="2.5" fill={primary} opacity="0.25" />
            <text x="15" y="22" fill={muted} fontSize="5" fontFamily="system-ui" textAnchor="middle">{n.slice(0,4)}</text>
          </g>
        ))}
        {["Pictures","Videos","Projects","Public"].map((n, i) => (
          <g key={n} transform={`translate(${72 + i * 36}, 94)`}>
            <rect x="0" y="0" width="30" height="26" rx="4" fill={accent} opacity="0.08" />
            <rect x="0" y="0" width="30" height="5" rx="2.5" fill={accent} opacity="0.2" />
            <text x="15" y="22" fill={muted} fontSize="5" fontFamily="system-ui" textAnchor="middle">{n.slice(0,4)}</text>
          </g>
        ))}

        {/* Window: terminal (overlapping) */}
        <rect x="160" y="100" width="220" height="140" rx="8" fill={term} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <rect x="160" y="100" width="220" height="20" rx="8" fill={termBar} />
        <rect x="160" y="110" width="220" height="10" fill={termBar} />
        <circle cx="170" cy="110" r="3" fill={red} /><circle cx="178" cy="110" r="3" fill={yellow} /><circle cx="186" cy="110" r="3" fill={green} />
        <text x="270" y="113" fill="#7070A0" fontSize="7" fontFamily="system-ui" textAnchor="middle">Terminal</text>
        <text x="168" y="134" fill="#6080FF" fontSize="7" fontFamily="monospace">user@lingmo</text>
        <text x="220" y="134" fill="#8080A0" fontSize="7" fontFamily="monospace">:~$</text>
        <text x="242" y="134" fill="#E8E8F4" fontSize="7" fontFamily="monospace">neofetch</text>
        <text x="168" y="148" fill={accent} fontSize="6.5" fontFamily="monospace">OS: Lingmo OS 3.0.5</text>
        <text x="168" y="160" fill={accent} fontSize="6.5" fontFamily="monospace">Kernel: 6.8.0-lingmo</text>
        <text x="168" y="172" fill={accent} fontSize="6.5" fontFamily="monospace">DE: Lingmo Shell 3.0</text>
        <text x="168" y="184" fill={green} fontSize="6.5" fontFamily="monospace">Packages: 2847 (dpkg)</text>
        <text x="168" y="198" fill="#6080FF" fontSize="7" fontFamily="monospace">user@lingmo:~$</text>
        <rect x="246" y="191" width="5" height="9" rx="1" fill="#E8E8F4" opacity="0.7" />

        {/* Dock */}
        <rect x="110" y="264" width="180" height="26" rx="13" fill={isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)"} stroke={border} strokeWidth="0.5" />
        {[primary, accent, primary, green, yellow, primary, muted, muted].map((c, i) => (
          <rect key={i} x={120 + i * 20} y="270" width="14" height="14" rx="4" fill={c} opacity={i < 4 ? 0.5 : 0.25} />
        ))}
        <rect x="125" y="283" width="6" height="2" rx="1" fill={primary} opacity="0.7" />
      </svg>
    );
  }

  if (category === "settings") {
    return (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <rect width="400" height="300" rx="12" fill={bg} />
        {/* Settings window */}
        <rect x="20" y="16" width="360" height="268" rx="10" fill={win} stroke={border} strokeWidth="0.5" />
        <rect x="20" y="16" width="360" height="32" rx="10" fill={winBar} />
        <rect x="20" y="36" width="360" height="12" fill={winBar} />
        <circle cx="34" cy="32" r="4.5" fill={red} /><circle cx="46" cy="32" r="4.5" fill={yellow} /><circle cx="58" cy="32" r="4.5" fill={green} />
        <text x="200" y="36" fill={fg} fontSize="11" fontFamily="system-ui" textAnchor="middle" opacity="0.7">Settings</text>
        {/* Sidebar */}
        <rect x="20" y="48" width="110" height="236" fill={sidebar} />
        <line x1="130" y1="48" x2="130" y2="284" stroke={border} strokeWidth="0.5" />
        {/* Search */}
        <rect x="28" y="56" width="94" height="18" rx="9" fill={isDark ? "rgba(255,255,255,0.06)" : "rgba(60,80,180,0.06)"} />
        <text x="36" y="68" fill={muted} fontSize="8" fontFamily="system-ui" opacity="0.7">Search…</text>
        {[
          { label: "Appearance", color: "#B47FFF", active: true },
          { label: "Display", color: primary },
          { label: "Sound", color: accent },
          { label: "Network", color: green },
          { label: "Bluetooth", color: "#4FC3F7" },
          { label: "Power", color: yellow },
          { label: "Users", color: primary },
          { label: "Privacy", color: red },
          { label: "About", color: muted },
        ].map(({ label, color, active }, i) => (
          <g key={label}>
            {active && <rect x="20" y={82 + i * 22} width="110" height="20" fill={primary} opacity="0.1" />}
            <rect x="28" y={86 + i * 22} width="12" height="12" rx="3" fill={color} opacity={active ? 0.7 : 0.3} />
            <text x="46" y={96 + i * 22} fill={active ? primary : muted} fontSize="9" fontFamily="system-ui" opacity={active ? 1 : 0.7}>{label}</text>
          </g>
        ))}
        {/* Content panel */}
        <text x="144" y="70" fill={fg} fontSize="12" fontFamily="system-ui" fontWeight="600" opacity="0.9">Appearance</text>
        <line x1="138" y1="78" x2="372" y2="78" stroke={border} strokeWidth="0.5" />
        {/* Theme section */}
        <text x="144" y="96" fill={muted} fontSize="8" fontFamily="system-ui" fontWeight="600" opacity="0.8">COLOR SCHEME</text>
        {["Light", "Dark", "Auto"].map((label, i) => (
          <g key={label}>
            <rect x={144 + i * 72} y="102" width="60" height="44" rx="8" fill={primary} opacity={i === 1 ? 0.2 : 0.07} stroke={i === 1 ? primary : "transparent"} strokeWidth="1.5" />
            <rect x={152 + i * 72} y="108" width="44" height="26" rx="4" fill={i === 0 ? "#F0F4FF" : i === 1 ? "#0D0D2A" : "url(#auto-split)"} opacity="0.6" />
            <text x={174 + i * 72} y="156" fill={i === 1 ? primary : muted} fontSize="8" fontFamily="system-ui" textAnchor="middle">{label}</text>
          </g>
        ))}
        {/* Accent color */}
        <text x="144" y="176" fill={muted} fontSize="8" fontFamily="system-ui" fontWeight="600" opacity="0.8">ACCENT COLOR</text>
        {[primary, "#B47FFF", "#FF6EE7", green, red, yellow, "#FF9500", accent].map((c, i) => (
          <g key={i}>
            <circle cx={152 + i * 22} cy="192" r="9" fill={c} opacity="0.75" />
            {i === 0 && <circle cx={152} cy="192" r="5" fill="white" opacity="0.5" />}
          </g>
        ))}
        {/* Font size */}
        <text x="144" y="218" fill={muted} fontSize="8" fontFamily="system-ui" fontWeight="600" opacity="0.8">FONT SIZE</text>
        <rect x="144" y="224" width="220" height="8" rx="4" fill={isDark ? "rgba(255,255,255,0.08)" : "rgba(60,80,180,0.08)"} />
        <rect x="144" y="224" width="140" height="8" rx="4" fill={primary} opacity="0.45" />
        <circle cx="284" cy="228" r="6" fill={primary} opacity="0.8" />
        {/* Toggle */}
        <text x="144" y="250" fill={fg} fontSize="9" fontFamily="system-ui" opacity="0.8">Animations</text>
        <rect x="320" y="240" width="34" height="18" rx="9" fill={primary} opacity="0.5" />
        <circle cx="343" cy="249" r="7" fill="white" opacity="0.9" />
        <text x="144" y="270" fill={fg} fontSize="9" fontFamily="system-ui" opacity="0.8">Rounded corners</text>
        <rect x="320" y="260" width="34" height="18" rx="9" fill={muted} opacity="0.25" />
        <circle cx="328" cy="269" r="7" fill="white" opacity="0.7" />
      </svg>
    );
  }

  if (category === "terminal") {
    return (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <rect width="400" height="300" rx="12" fill={term} />
        {/* Title bar */}
        <rect x="0" y="0" width="400" height="36" rx="12" fill={termBar} />
        <rect x="0" y="24" width="400" height="12" fill={termBar} />
        <circle cx="18" cy="18" r="5.5" fill={red} /><circle cx="34" cy="18" r="5.5" fill={yellow} /><circle cx="50" cy="18" r="5.5" fill={green} />
        {/* Tabs */}
        <rect x="70" y="8" width="80" height="20" rx="4" fill={primary} opacity="0.15" />
        <text x="110" y="21" fill={fg} fontSize="9" fontFamily="system-ui" textAnchor="middle" opacity="0.75">bash</text>
        <rect x="155" y="8" width="60" height="20" rx="4" fill="transparent" />
        <text x="185" y="21" fill={muted} fontSize="9" fontFamily="system-ui" textAnchor="middle" opacity="0.5">zsh</text>
        <text x="360" y="22" fill={muted} fontSize="14" fontFamily="system-ui" opacity="0.5">+</text>

        {/* Terminal lines */}
        {/* PS1 + command 1 */}
        <text x="16" y="60" fill="#6080FF" fontSize="10" fontFamily="monospace">user</text>
        <text x="48" y="60" fill="#8080A0" fontSize="10" fontFamily="monospace">@</text>
        <text x="58" y="60" fill={green} fontSize="10" fontFamily="monospace">lingmo</text>
        <text x="108" y="60" fill="#8080A0" fontSize="10" fontFamily="monospace">:~$ </text>
        <text x="134" y="60" fill={fg} fontSize="10" fontFamily="monospace">git log --oneline</text>

        {/* git log output */}
        <text x="16" y="78" fill={yellow} fontSize="9.5" fontFamily="monospace">a3f2c1e</text>
        <text x="70" y="78" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">feat: add Wayland multi-monitor support</text>
        <text x="16" y="94" fill={yellow} fontSize="9.5" fontFamily="monospace">b8e14da</text>
        <text x="70" y="94" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">fix: panel crash on HiDPI displays</text>
        <text x="16" y="110" fill={yellow} fontSize="9.5" fontFamily="monospace">c9d3410</text>
        <text x="70" y="110" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">chore: bump Qt to 6.7.2</text>
        <text x="16" y="126" fill={yellow} fontSize="9.5" fontFamily="monospace">f1a2b8c</text>
        <text x="70" y="126" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">refactor: kwin compositor pipeline</text>

        {/* PS1 + command 2 */}
        <text x="16" y="150" fill="#6080FF" fontSize="10" fontFamily="monospace">user</text>
        <text x="48" y="150" fill="#8080A0" fontSize="10" fontFamily="monospace">@</text>
        <text x="58" y="150" fill={green} fontSize="10" fontFamily="monospace">lingmo</text>
        <text x="108" y="150" fill="#8080A0" fontSize="10" fontFamily="monospace">:~/src$ </text>
        <text x="152" y="150" fill={fg} fontSize="10" fontFamily="monospace">make -j8</text>

        {/* make output */}
        <text x="16" y="168" fill={green} fontSize="9.5" fontFamily="monospace">  CC</text>
        <text x="48" y="168" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">src/main.cpp</text>
        <text x="16" y="184" fill={green} fontSize="9.5" fontFamily="monospace">  CC</text>
        <text x="48" y="184" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">src/compositor/pipeline.cpp</text>
        <text x="16" y="200" fill={green} fontSize="9.5" fontFamily="monospace">  LD</text>
        <text x="48" y="200" fill="#D0D0E8" fontSize="9.5" fontFamily="monospace">lingmo-shell</text>
        <text x="16" y="216" fill={accent} fontSize="9.5" fontFamily="monospace">Build finished in 18.4s</text>

        {/* PS1 + command 3 */}
        <text x="16" y="240" fill="#6080FF" fontSize="10" fontFamily="monospace">user</text>
        <text x="48" y="240" fill="#8080A0" fontSize="10" fontFamily="monospace">@</text>
        <text x="58" y="240" fill={green} fontSize="10" fontFamily="monospace">lingmo</text>
        <text x="108" y="240" fill="#8080A0" fontSize="10" fontFamily="monospace">:~/src$ </text>
        <text x="152" y="240" fill={fg} fontSize="10" fontFamily="monospace">sudo systemctl restart sddm</text>
        <text x="16" y="260" fill="#8080A0" fontSize="10" fontFamily="monospace">[sudo] password for user: </text>

        {/* Blinking cursor */}
        <rect x="16" y="272" width="7" height="13" rx="1.5" fill={fg} opacity="0.8" />
      </svg>
    );
  }

  if (category === "store") {
    return (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <rect width="400" height="300" rx="12" fill={bg} />
        {/* Store window */}
        <rect x="16" y="12" width="368" height="276" rx="10" fill={win} stroke={border} strokeWidth="0.5" />
        <rect x="16" y="12" width="368" height="32" rx="10" fill={winBar} />
        <rect x="16" y="32" width="368" height="12" fill={winBar} />
        <circle cx="30" cy="28" r="4.5" fill={red} /><circle cx="42" cy="28" r="4.5" fill={yellow} /><circle cx="54" cy="28" r="4.5" fill={green} />
        <text x="200" y="32" fill={fg} fontSize="11" fontFamily="system-ui" textAnchor="middle" opacity="0.7">App Store</text>
        {/* Search bar */}
        <rect x="80" y="48" width="240" height="20" rx="10" fill={isDark ? "rgba(255,255,255,0.06)" : "rgba(60,80,180,0.06)"} />
        <text x="110" y="62" fill={muted} fontSize="9" fontFamily="system-ui">Search apps…</text>
        {/* Nav tabs */}
        {["Featured", "Installed", "Updates"].map((tab, i) => (
          <g key={tab}>
            {i === 0 && <rect x={26 + i * 86} y="74" width="80" height="18" rx="4" fill={primary} opacity="0.12" />}
            <text x={66 + i * 86} y="87" fill={i === 0 ? primary : muted} fontSize="9" fontFamily="system-ui" textAnchor="middle" opacity={i === 0 ? 1 : 0.7}>{tab}</text>
          </g>
        ))}
        <line x1="16" y1="96" x2="384" y2="96" stroke={border} strokeWidth="0.5" />
        {/* Featured section label */}
        <text x="28" y="114" fill={fg} fontSize="10" fontFamily="system-ui" fontWeight="600" opacity="0.8">Featured</text>
        {/* App cards row 1 */}
        {[
          { name: "VS Code", color: "#007ACC", sub: "Editor" },
          { name: "Firefox", color: "#FF7139", sub: "Browser" },
          { name: "Telegram", color: "#2AABEE", sub: "Chat" },
          { name: "GIMP", color: "#7A7A7A", sub: "Design" },
        ].map(({ name, color, sub }, i) => (
          <g key={name} transform={`translate(${24 + i * 86}, 120)`}>
            <rect x="0" y="0" width="78" height="80" rx="8" fill={isDark ? "rgba(255,255,255,0.04)" : "rgba(60,80,180,0.04)"} stroke={border} strokeWidth="0.5" />
            <rect x="22" y="8" width="34" height="34" rx="8" fill={color} opacity="0.35" />
            <text x="39" y="30" fill={color} fontSize="13" fontFamily="system-ui" textAnchor="middle" fontWeight="700" opacity="0.9">{name[0]}</text>
            <text x="39" y="54" fill={fg} fontSize="8" fontFamily="system-ui" textAnchor="middle" opacity="0.85">{name}</text>
            <text x="39" y="64" fill={muted} fontSize="7" fontFamily="system-ui" textAnchor="middle">{sub}</text>
            <rect x="16" y="68" width="46" height="8" rx="4" fill={primary} opacity="0.2" />
            <text x="39" y="75" fill={primary} fontSize="7" fontFamily="system-ui" textAnchor="middle">Install</text>
          </g>
        ))}
        {/* App cards row 2 */}
        {[
          { name: "VLC", color: "#FF8800", sub: "Video" },
          { name: "LibreOffice", color: "#1C7E24", sub: "Office" },
          { name: "OBS", color: "#4A2B82", sub: "Stream" },
          { name: "Blender", color: "#EA7600", sub: "3D" },
        ].map(({ name, color, sub }, i) => (
          <g key={name} transform={`translate(${24 + i * 86}, 210)`}>
            <rect x="0" y="0" width="78" height="60" rx="8" fill={isDark ? "rgba(255,255,255,0.03)" : "rgba(60,80,180,0.03)"} stroke={border} strokeWidth="0.5" />
            <rect x="8" y="8" width="28" height="28" rx="7" fill={color} opacity="0.3" />
            <text x="22" y="27" fill={color} fontSize="11" fontFamily="system-ui" textAnchor="middle" fontWeight="700" opacity="0.8">{name[0]}</text>
            <text x="46" y="20" fill={fg} fontSize="8" fontFamily="system-ui" opacity="0.85">{name}</text>
            <text x="46" y="32" fill={muted} fontSize="7" fontFamily="system-ui">{sub}</text>
            {/* Stars */}
            {[0,1,2,3,4].map(s => (
              <text key={s} x={46 + s * 7} y="44" fill={s < 4 ? yellow : muted} fontSize="7" fontFamily="system-ui" opacity="0.8">★</text>
            ))}
          </g>
        ))}
      </svg>
    );
  }

  if (category === "file-manager") {
    return (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <rect width="400" height="300" rx="12" fill={bg} />
        <rect x="14" y="12" width="372" height="276" rx="10" fill={win} stroke={border} strokeWidth="0.5" />
        {/* Titlebar */}
        <rect x="14" y="12" width="372" height="32" rx="10" fill={winBar} />
        <rect x="14" y="32" width="372" height="12" fill={winBar} />
        <circle cx="28" cy="28" r="4.5" fill={red} /><circle cx="40" cy="28" r="4.5" fill={yellow} /><circle cx="52" cy="28" r="4.5" fill={green} />
        {/* Navigation */}
        <path d="M68 22 L64 28 L68 34" stroke={fg} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        <path d="M78 22 L82 28 L78 34" stroke={fg} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        {/* Breadcrumb */}
        <rect x="92" y="20" width="140" height="16" rx="8" fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(60,80,180,0.05)"} />
        <text x="100" y="31" fill={muted} fontSize="8.5" fontFamily="system-ui">Home  /  Documents</text>
        {/* Search */}
        <rect x="280" y="20" width="90" height="16" rx="8" fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(60,80,180,0.05)"} />
        <text x="290" y="31" fill={muted} fontSize="8" fontFamily="system-ui">Search…</text>
        {/* Toolbar */}
        <rect x="14" y="44" width="372" height="24" fill={isDark ? "rgba(0,0,0,0.1)" : "rgba(60,80,180,0.02)"} />
        <line x1="14" y1="68" x2="386" y2="68" stroke={border} strokeWidth="0.5" />
        <text x="22" y="60" fill={muted} fontSize="8" fontFamily="system-ui">New folder</text>
        <text x="80" y="60" fill={muted} fontSize="8" fontFamily="system-ui">Upload</text>
        <text x="122" y="60" fill={muted} fontSize="8" fontFamily="system-ui">Sort</text>
        {/* Sidebar */}
        <rect x="14" y="68" width="90" height="220" fill={sidebar} />
        <line x1="104" y1="68" x2="104" y2="288" stroke={border} strokeWidth="0.5" />
        <text x="20" y="82" fill={muted} fontSize="7" fontFamily="system-ui" fontWeight="700" opacity="0.7">PLACES</text>
        {[
          ["Home", primary, true],
          ["Desktop", muted, false],
          ["Documents", muted, false],
          ["Downloads", muted, false],
          ["Music", muted, false],
          ["Pictures", muted, false],
          ["Videos", muted, false],
        ].map(([name, color, active], i) => (
          <g key={String(name)}>
            {active && <rect x="14" y={87 + i * 20} width="90" height="18" fill={primary} opacity="0.1" />}
            <rect x="20" y={91 + i * 20} width="9" height="9" rx="2" fill={String(color)} opacity={active ? 0.6 : 0.18} />
            <text x="34" y={100 + i * 20} fill={String(color)} fontSize="8" fontFamily="system-ui" opacity={active ? 1 : 0.65}>{String(name)}</text>
          </g>
        ))}
        <line x1="20" y1="236" x2="94" y2="236" stroke={border} strokeWidth="0.5" />
        <text x="20" y="248" fill={muted} fontSize="7" fontFamily="system-ui" fontWeight="700" opacity="0.7">DEVICES</text>
        <rect x="20" y="252" width="9" height="9" rx="2" fill={muted} opacity="0.2" />
        <text x="34" y="260" fill={muted} fontSize="8" fontFamily="system-ui" opacity="0.6">Drive (89%)</text>
        <rect x="20" y="264" width="68" height="4" rx="2" fill={muted} opacity="0.08" />
        <rect x="20" y="264" width="60" height="4" rx="2" fill={primary} opacity="0.3" />
        {/* Main content: folders */}
        {["Work", "Reports", "Archives", "Images", "Code", "Misc"].map((name, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <g key={name} transform={`translate(${114 + col * 90}, ${80 + row * 80})`}>
              <rect x="0" y="0" width="78" height="68" rx="8" fill={primary} opacity="0.08" />
              <rect x="0" y="0" width="78" height="10" rx="5" fill={primary} opacity="0.2" />
              <rect x="12" y="16" width="54" height="36" rx="5" fill={primary} opacity="0.1" />
              <text x="39" y="62" fill={muted} fontSize="9" fontFamily="system-ui" textAnchor="middle">{name}</text>
            </g>
          );
        })}
        {/* Status bar */}
        <rect x="14" y="274" width="372" height="14" fill={isDark ? "rgba(0,0,0,0.1)" : "rgba(60,80,180,0.02)"} />
        <line x1="14" y1="274" x2="386" y2="274" stroke={border} strokeWidth="0.5" />
        <text x="22" y="284" fill={muted} fontSize="7" fontFamily="system-ui">6 items — 128 MB used</text>
      </svg>
    );
  }

  if (category === "wallpaper") {
    return (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <defs>
          <linearGradient id="gal-wall-main" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0D102A" />
            <stop offset="50%" stopColor="#1A1060" />
            <stop offset="100%" stopColor="#0A1828" />
          </linearGradient>
          <radialGradient id="gal-wall-g1" cx="30%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#4F7CFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4F7CFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gal-wall-g2" cx="75%" cy="65%" r="45%">
            <stop offset="0%" stopColor="#6EE7FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6EE7FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gal-wall-g3" cx="60%" cy="20%" r="40%">
            <stop offset="0%" stopColor="#B47FFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#B47FFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" rx="12" fill="url(#gal-wall-main)" />
        <rect width="400" height="300" rx="12" fill="url(#gal-wall-g1)" />
        <rect width="400" height="300" rx="12" fill="url(#gal-wall-g2)" />
        <rect width="400" height="300" rx="12" fill="url(#gal-wall-g3)" />
        {/* Star field */}
        {[
          [40, 30], [80, 60], [120, 20], [160, 80], [200, 40], [240, 70], [280, 25], [320, 55],
          [360, 35], [60, 130], [100, 160], [150, 110], [190, 170], [230, 140], [270, 120],
          [310, 150], [350, 130], [30, 200], [70, 230], [110, 210], [160, 250], [200, 220],
          [250, 260], [290, 240], [340, 260], [380, 210], [55, 270], [95, 290], [135, 270],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.5 : 1} fill="white" opacity={0.3 + (i % 4) * 0.1} />
        ))}
        {/* Central abstract shape */}
        <path
          d="M200 60 Q260 80 280 150 Q300 220 200 240 Q100 220 120 150 Q140 80 200 60Z"
          fill="none"
          stroke="rgba(110,231,255,0.15)"
          strokeWidth="1.5"
        />
        <path
          d="M200 80 Q248 98 264 155 Q280 212 200 226 Q120 212 136 155 Q152 98 200 80Z"
          fill="rgba(79,124,255,0.08)"
          stroke="rgba(79,124,255,0.2)"
          strokeWidth="1"
        />
        {/* Lingmo orb */}
        <circle cx="200" cy="150" r="50" fill="none" stroke="rgba(110,231,255,0.2)" strokeWidth="1" />
        <circle cx="200" cy="150" r="35" fill="none" stroke="rgba(79,124,255,0.25)" strokeWidth="1" />
        <circle cx="200" cy="150" r="20" fill="rgba(79,124,255,0.15)" />
        <circle cx="200" cy="150" r="10" fill="rgba(110,231,255,0.3)" />
        {/* Horizontal light streak */}
        <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(110,231,255,0.06)" strokeWidth="1" />
        {/* Brand text */}
        <text x="200" y="295" fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="system-ui" textAnchor="middle" letterSpacing="4">LINGMO OS</text>
      </svg>
    );
  }

  // Fallback
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <rect width="400" height="300" rx="12" fill={bg} />
    </svg>
  );
}
