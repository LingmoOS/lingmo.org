import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const footerColumns = [
  { key: "lingmo", links: [{ href: "/about", key: "about" }, { href: "/download", key: "download" }, { href: "/documentation", key: "docs" }, { href: "/gallery", key: "gallery" }] },
  { key: "downloads", links: [{ href: "/download", key: "download" }, { href: "/releases", key: "releases" }, { href: "/donate", key: "donate" }] },
  { key: "resources", links: [{ href: "/blog", key: "blog" }, { href: "/faq", key: "faq" }, { href: "/documentation", key: "docs" }] },
  { key: "community", links: [{ href: "/community", key: "community" }, { href: "https://github.com/LingmoOS", key: "github" }, { href: "https://discord.gg/lingmo", key: "discord" }] },
  { key: "legal", links: [{ href: "/privacy", key: "privacy" }, { href: "/license", key: "license" }] },
];

const friendLinks = [
  { name: "Linux", url: "https://www.linuxfoundation.org" },
  { name: "Debian", url: "https://www.debian.org" },
  { name: "Fedora", url: "https://fedoraproject.org" },
  { name: "Ubuntu", url: "https://ubuntu.com" },
  { name: "Arch Linux", url: "https://archlinux.org" },
  { name: "GNOME", url: "https://www.gnome.org" },
  { name: "KDE", url: "https://kde.org" },
  { name: "Qt", url: "https://www.qt.io" },
  { name: "LLVM", url: "https://llvm.org" },
  { name: "Mesa", url: "https://www.mesa3d.org" },
  { name: "Wayland", url: "https://wayland.freedesktop.org" },
  { name: "FreeDesktop", url: "https://www.freedesktop.org" },
];

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-border dark:border-border-dark">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {footerColumns.map((col) => (
            <div key={col.key}>
              <h3 className="mb-4 text-sm font-semibold">{t(col.key)}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted dark:text-muted-dark hover:text-foreground dark:hover:text-foreground-dark transition-colors"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border dark:border-border-dark">
          <h3 className="mb-4 text-sm font-semibold">{t("friendLinks")}</h3>
          <div className="flex flex-wrap gap-4">
            {friendLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted dark:text-muted-dark hover:text-foreground dark:hover:text-foreground-dark transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted dark:text-muted-dark">
          <p>{t("copyright")}</p>
          <p className="mt-1">{t("poweredBy")} Next.js</p>
          <p>{t("builtWith")} React</p>
        </div>
      </div>
    </footer>
  );
}
