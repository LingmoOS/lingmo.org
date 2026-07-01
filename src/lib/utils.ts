import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, locale: string = "en"): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function absolutifyUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://lingmo.org";
  return new URL(path, base).toString();
}
