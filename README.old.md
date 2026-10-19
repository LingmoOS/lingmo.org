# Lingmo OS Website

Official website for [Lingmo OS](https://lingmo.org) — a modern, elegant, and open-source operating system.

Built with [Next.js 15](https://nextjs.org), [Tailwind CSS v4](https://tailwindcss.com), and [next-intl](https://next-intl.dev).

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Motion:** Framer Motion
- **Icons:** Lucide React
- **Internationalization:** next-intl (en, zh-CN, zh-TW, ja)
- **Package Manager:** pnpm

## Project Structure

```
├── public/
│   └── content/          # All site data (JSON + Markdown)
│       ├── downloads.json # Download config (editions, architectures, versions)
│       ├── update.json    # Update channel config (build versions, release info)
│       └── releases/      # Release notes (Markdown, one dir per build version)
├── messages/              # i18n locale files (JSON)
├── src/
│   ├── app/
│   │   ├── [locale]/      # 15 localized pages (Home, Download, Blog, etc.)
│   │   ├── api/v1/        # REST API endpoints (update, manifest)
│   │   └── manifest.json/ # Service entry point
│   ├── components/
│   │   ├── ui/            # Reusable UI components (Button, Card, etc.)
│   │   ├── layout/        # Navbar, Footer, MainLayout
│   │   ├── svg/           # Placeholder SVG components
│   │   └── download/      # Download dialog component
│   ├── lib/               # Utilities (build version parser, markdown-to-HTML, etc.)
│   ├── types/             # TypeScript interfaces
│   └── i18n/              # i18n routing and request config
└── content/               # (moved to public/content/ at runtime)
```

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
pnpm build
pnpm start
```

## Internationalization

Supported locales: `en`, `zh-CN`, `zh-TW`, `ja`.

Translation files live in `messages/`. Add a new locale by creating a new JSON file and updating the config.

## Content Management

All content is Git-driven via the `public/content/` directory:

| File | Purpose |
|---|---|
| `downloads.json` | Download editions, architectures, versions, ISO links |
| `update.json` | OTA update channels and build version data |
| `releases/<ver>/<locale>.md` | Per-version release notes (shared by website and API) |
| `mirrors.json` | Mirror list |
| `blog.json` | Blog posts metadata |
| `gallery.json` | Screenshot gallery data |
| `sponsors.json` | Sponsor list |
| `faq.json` | FAQ entries |

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/v1/update` | Legacy update check (returns latest directly) |
| `GET /api/v1/update/check` | Build version comparison (with release notes in HTML) |
| `GET /manifest.json` | Service entry manifest (channels, architectures) |

### Update Check API

```
GET /api/v1/update/check?channel=stable&arch=x86_64&build=26a01&locale=zh-CN
```

Build version format: `<Major><Stage><Revision>` (e.g., `26R01`, `26b01`, `26a01`).

Stage priority: `R` (Release) > `b` (Beta) > `a` (Alpha) > extensible (`d`, `rc`, `LTS`).

Response includes release notes as HTML (parsed from `content/releases/` Markdown files), ready for `QTextBrowser::setHtml()`.

## Design

- **Glass morphism:** `backdrop-filter: blur(24px)` cards
- **Colors:** `#FAFAFB` / `#09090B` backgrounds, `#4F7CFF` primary, `#6EE7FF` accent
- **Theme:** Light / Dark / Auto (system preference)
- **Animations:** Framer Motion with Command Palette–style dialog (fade + scale + blur, 200ms)

## License

[GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html)
