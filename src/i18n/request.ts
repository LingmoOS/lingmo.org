import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

import en from "../../messages/en.json";
import zhCN from "../../messages/zh-CN.json";
import zhTW from "../../messages/zh-TW.json";
import ja from "../../messages/ja.json";

/** 支持的语言，直接从路由配置推导，避免与 routing.ts 漂移 */
type Locale = (typeof routing.locales)[number];

/**
 * 显式的「语言 -> messages」静态映射。
 *
 * 之前用的是模板字符串动态导入：
 *   (await import(`../../messages/${locale}.json`)).default
 * 这种写法把模块解析推迟到运行时，在边缘运行时下行为不确定；
 * 改成逐个静态 import 后，打包期就能确定全部四个模块，
 * 运行时只做一次查表，结果完全可预测。
 */
const messagesByLocale: Record<Locale, typeof en> = {
  en,
  "zh-CN": zhCN as typeof en,
  "zh-TW": zhTW as typeof en,
  ja: ja as typeof en,
};

function hasLocale(locale: string): locale is Locale {
  return (routing.locales as readonly string[]).includes(locale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  const locale: Locale = requested && hasLocale(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: messagesByLocale[locale] ?? messagesByLocale[routing.defaultLocale],
  };
});
