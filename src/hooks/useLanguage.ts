import { useLocale } from "next-intl";

export type Locale = "en" | "zh-CN" | "zh-TW" | "ja";

export function useLanguage() {
  const locale = useLocale() as Locale;
  return { locale };
}
