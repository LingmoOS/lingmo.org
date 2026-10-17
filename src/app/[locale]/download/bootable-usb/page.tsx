import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

/**
 * 启动盘制作指引（服务端组件，纯静态内容，没有数据文件）。
 *
 * 命令块里的设备名与文件名为示例，正文中明确要求按实际输出替换；
 * 没有随镜像发布签名文件时不写具体签名文件名。
 *
 * 不声明 `generateStaticParams()`：`[locale]/layout.tsx` 已声明 `runtime = "edge"`。
 */

/** 下载页与构建仓库发布页，页面底部回到这两处。 */
const DOWNLOAD_PATH = "/download";
const BUILDER_RELEASES_URL = "https://github.com/LingmoOS/lingmo-builder/releases";

const ddCommands = `lsblk
sudo dd if=lingmo-os.iso of=/dev/sdX bs=4M status=progress conv=fsync`;

const cpCommands = `sudo cp lingmo-os.iso /dev/sdX
sync`;

const macCommands = `diskutil list
diskutil unmountDisk /dev/diskN
sudo dd if=lingmo-os.iso of=/dev/rdiskN bs=4m`;

const shaCommand = `sha256sum lingmo-os.iso`;

const shaCheckCommand = `sha256sum -c checksum-file`;

const gpgCommand = `gpg --verify signature-file lingmo-os.iso`;

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl bg-black/5 p-4 text-xs leading-relaxed dark:bg-white/5">
      <code className="font-mono">{children}</code>
    </pre>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bootableUsb" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function BootableUsbPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bootableUsb" });

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[
          { label: t("downloadTitle"), href: "/download" },
          { label: t("pageTitle") },
        ]}
      />

      <Section>
        <h2 className="mb-4 text-2xl font-bold">{t("prepareTitle")}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted dark:text-muted-dark">
          {t("prepareText")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={DOWNLOAD_PATH}>
            <Button variant="primary">{t("prepareDownload")}</Button>
          </Link>
          <a href={BUILDER_RELEASES_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">{t("prepareBuilder")}</Button>
          </a>
        </div>
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <h2 className="mb-4 text-2xl font-bold">{t("linuxTitle")}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted dark:text-muted-dark">
          {t("linuxText")}
        </p>
        <p className="mt-4 max-w-3xl rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
          {t("linuxWarning")}
        </p>

        <h3 className="mt-8 text-lg font-semibold">{t("linuxDdLabel")}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted dark:text-muted-dark">
          {t("linuxDdText")}
        </p>
        <CodeBlock>{ddCommands}</CodeBlock>

        <h3 className="mt-8 text-lg font-semibold">{t("linuxCpLabel")}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted dark:text-muted-dark">
          {t("linuxCpText")}
        </p>
        <CodeBlock>{cpCommands}</CodeBlock>
      </Section>

      <Section>
        <h2 className="mb-4 text-2xl font-bold">{t("windowsTitle")}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card glass={false} hover={false}>
            <h3 className="text-lg font-semibold">{t("windowsVentoyLabel")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted dark:text-muted-dark">
              {t("windowsVentoyText")}
            </p>
          </Card>
          <Card glass={false} hover={false}>
            <h3 className="text-lg font-semibold">{t("windowsRufusLabel")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted dark:text-muted-dark">
              {t("windowsRufusText")}
            </p>
          </Card>
        </div>
        <p className="mt-6 text-sm text-muted dark:text-muted-dark">{t("windowsOfficialTool")}</p>
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <h2 className="mb-4 text-2xl font-bold">{t("macosTitle")}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted dark:text-muted-dark">
          {t("macosText")}
        </p>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted dark:text-muted-dark">
          <li>{t("macosStepList")}</li>
          <li>{t("macosStepUnmount")}</li>
          <li>{t("macosStepWrite")}</li>
        </ol>
        <CodeBlock>{macCommands}</CodeBlock>
      </Section>

      <Section>
        <h2 className="mb-4 text-2xl font-bold">{t("verifyTitle")}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted dark:text-muted-dark">
          {t("verifyIntro")}
        </p>

        <div className="mt-8 max-w-3xl space-y-8">
          <div>
            <h3 className="text-lg font-semibold">{t("verifyShaTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted dark:text-muted-dark">
              {t("verifyShaText")}
            </p>
            <CodeBlock>{shaCommand}</CodeBlock>
          </div>

          <div>
            <h3 className="text-lg font-semibold">{t("verifyFileTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted dark:text-muted-dark">
              {t("verifyFileText")}
            </p>
            <CodeBlock>{shaCheckCommand}</CodeBlock>
          </div>

          <div>
            <h3 className="text-lg font-semibold">{t("verifyGpgTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted dark:text-muted-dark">
              {t("verifyGpgText")}
            </p>
            <CodeBlock>{gpgCommand}</CodeBlock>
            <p className="mt-2 text-xs text-muted dark:text-muted-dark">{t("verifyGpgNote")}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Link
            href={DOWNLOAD_PATH}
            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            {t("backToDownload")}
          </Link>
          <a
            href={BUILDER_RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            {t("officialReleases")}
          </a>
        </div>
      </Section>
    </>
  );
}
