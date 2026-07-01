import { ChevronRight, Home } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav className={cn("flex items-center gap-1 text-sm text-muted dark:text-muted-dark", className)}>
      <Link href="/" className="hover:text-foreground dark:hover:text-foreground-dark transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground dark:hover:text-foreground-dark transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground dark:text-foreground-dark">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export type { BreadcrumbItem };
