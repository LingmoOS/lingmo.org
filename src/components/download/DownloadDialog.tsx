"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, CheckCircle2, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { DownloadConfig, ArchInfo } from "@/types";
import { Link } from "@/i18n/navigation";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: DownloadConfig | null;
}

function detectArch(config: DownloadConfig): string {
  if (typeof window === "undefined") return config.architectures.find((a) => a.recommended)?.id || config.architectures[0]?.id || "x86_64";
  const ua = window.navigator.userAgent;
  if (/arm64|aarch64|Apple\sSilicon|Mac/.test(ua)) return "arm64";
  if (/arm|Windows\sARM/.test(ua)) return "arm64";
  if (/x86_64|Win64|WOW64|x64/.test(ua)) return "x86_64";
  if (/loongarch|loongson/.test(ua)) return "loongarch";
  return config.architectures.find((a) => a.recommended)?.id || config.architectures[0]?.id || "x86_64";
}

export function DownloadDialog({ open, onOpenChange, config }: DownloadDialogProps) {
  const t = useTranslations("download");
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedEdition, setSelectedEdition] = useState<string>("");
  const [selectedArch, setSelectedArch] = useState<string>("");
  const [source, setSource] = useState<"official" | "sourceforge">("official");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!config || !open) return;
    const recommendedArch = detectArch(config);
    const arch = config.architectures.find((a) => a.id === recommendedArch);
    const finalArch = arch?.available ? recommendedArch : config.architectures.find((a) => a.available)?.id || recommendedArch;
    setSelectedArch(finalArch);
    const defaultEdition = config.editions.find((e) => e.available)?.id || "";
    setSelectedEdition(defaultEdition);
    setSource("official");
    setStep(1);
    setDownloading(false);
  }, [open, config]);

  const edition = config?.editions.find((e) => e.id === selectedEdition);
  const archObj = config?.architectures.find((a) => a.id === selectedArch);
  const versionInfo = config?.versions.find((v) => v.edition === selectedEdition) || config?.versions[0];
  const archInfo = versionInfo?.architectures[selectedArch] as ArchInfo | undefined;
  const canDownload = !!edition?.available && !!archObj?.available && !!archInfo?.available;

  const handleDownload = useCallback(() => {
    const url = source === "sourceforge" ? archInfo?.sourceforge : archInfo?.iso;
    if (!canDownload || !url) return;
    setDownloading(true);
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStep(2);
  }, [canDownload, archInfo, source]);

  useEffect(() => {
    if (step === 2 && downloading) {
      setDownloading(false);
    }
  }, [step, downloading]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setStep(1);
    setDownloading(false);
  }, [onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={cn(
                "relative w-full max-w-[720px] rounded-2xl border border-border dark:border-border-dark",
                "bg-white/70 dark:bg-black/70 backdrop-blur-2xl shadow-2xl",
                "max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:max-w-full max-sm:rounded-b-none max-sm:rounded-t-2xl"
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between border-b border-border dark:border-border-dark px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold">{t("dialogTitle")}</h2>
                  <p className="mt-0.5 text-sm text-muted dark:text-muted-dark">{t("dialogSubtitle")}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {step === 1 ? (
                <div className="p-6 space-y-6">
                  <section>
                    <h3 className="text-sm font-medium text-muted dark:text-muted-dark mb-3">{t("edition")}</h3>
                    <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
                      {config?.editions.map((ed) => (
                        <button
                          key={ed.id}
                          onClick={() => ed.available && setSelectedEdition(ed.id)}
                          disabled={!ed.available}
                          className={cn(
                            "relative rounded-xl border p-4 text-left transition-all duration-150",
                            selectedEdition === ed.id && ed.available
                              ? "border-primary bg-primary/5 dark:bg-primary/10"
                              : "border-border dark:border-border-dark hover:border-primary/40",
                            !ed.available && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          {ed.recommended && ed.available && (
                            <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-white">
                              {t("recommended")}
                            </span>
                          )}
                          <p className="font-medium">{ed.name}</p>
                          {!ed.available && (
                            <p className="mt-1 text-xs text-muted dark:text-muted-dark">{t("comingSoon")}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-medium text-muted dark:text-muted-dark mb-3">{t("architecture")}</h3>
                    <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
                      {config?.architectures.map((arch) => (
                        <button
                          key={arch.id}
                          onClick={() => arch.available && setSelectedArch(arch.id)}
                          disabled={!arch.available}
                          title={!arch.available ? t("notAvailable") : ""}
                          className={cn(
                            "relative rounded-xl border p-4 text-left transition-all duration-150",
                            selectedArch === arch.id && arch.available
                              ? "border-primary bg-primary/5 dark:bg-primary/10"
                              : "border-border dark:border-border-dark hover:border-primary/40",
                            !arch.available && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          {arch.recommended && (
                            <span className="absolute -top-2 right-3 rounded-full bg-success px-2 py-0.5 text-[10px] font-medium text-white">
                              {t("recommended")}
                            </span>
                          )}
                          <p className="font-medium">{arch.label}</p>
                          {arch.badge && (
                            <p className="mt-1 text-xs text-muted dark:text-muted-dark flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {arch.badge}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-medium text-muted dark:text-muted-dark mb-3">{t("source")}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSource("official")}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-all duration-150",
                          source === "official"
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-border dark:border-border-dark hover:border-primary/40"
                        )}
                      >
                        <p className="font-medium">{t("officialSource")}</p>
                      </button>
                      <button
                        onClick={() => setSource("sourceforge")}
                        disabled={!archInfo?.sourceforge}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-all duration-150",
                          source === "sourceforge" && archInfo?.sourceforge
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-border dark:border-border-dark hover:border-primary/40",
                          !archInfo?.sourceforge && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        <p className="font-medium">SourceForge</p>
                      </button>
                    </div>
                  </section>

                  <div className="flex items-center justify-between border-t border-border dark:border-border-dark pt-4">
                    <Button variant="ghost" onClick={handleClose}>
                      {t("cancel")}
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!canDownload || (source === "sourceforge" && !archInfo?.sourceforge)}
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t("download")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <CheckCircle2 className="h-16 w-16 text-success" />
                    </motion.div>
                    <h3 className="mt-4 text-lg font-semibold">{t("downloadStarted")}</h3>
                    <p className="mt-1 text-sm text-muted dark:text-muted-dark">{t("downloadHint")}</p>
                  </div>

                  <div className="rounded-xl border border-border dark:border-border-dark divide-y divide-border dark:divide-border-dark">
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-sm text-muted dark:text-muted-dark">{t("edition")}</span>
                      <span className="text-sm font-medium">{edition?.name || selectedEdition}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-sm text-muted dark:text-muted-dark">{t("architecture")}</span>
                      <span className="text-sm font-medium">{archObj?.label || selectedArch}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-sm text-muted dark:text-muted-dark">{t("version")}</span>
                      <span className="text-sm font-medium">{versionInfo?.version || config?.latest}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-sm text-muted dark:text-muted-dark">{t("isoSize")}</span>
                      <span className="text-sm font-medium">{archInfo?.size || "—"}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-sm text-muted dark:text-muted-dark">{t("releaseDate")}</span>
                      <span className="text-sm font-medium">{versionInfo?.releaseDate || "—"}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-sm text-muted dark:text-muted-dark">{t("source")}</span>
                      <span className="text-sm font-medium">{source === "official" ? t("officialSource") : "SourceForge"}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted dark:text-muted-dark">{t("quickLinks")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {config?.quickLinks.sha256 && (
                        <a href={config.quickLinks.sha256} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            {t("sha256")}
                          </Button>
                        </a>
                      )}
                      {config?.quickLinks.releaseNotes && (
                        <Link href={config.quickLinks.releaseNotes}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            {t("releaseNotes")}
                          </Button>
                        </Link>
                      )}
                      {config?.quickLinks.installationGuide && (
                        <Link href={config.quickLinks.installationGuide}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            {t("installationGuide")}
                          </Button>
                        </Link>
                      )}
                      {config?.quickLinks.systemRequirements && (
                        <Link href={config.quickLinks.systemRequirements}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            {t("systemRequirements")}
                          </Button>
                        </Link>
                      )}
                      {config?.quickLinks.mirrors && (
                        <Link href={config.quickLinks.mirrors}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            {t("mirrors")}
                          </Button>
                        </Link>
                      )}
                      {config?.quickLinks.reportIssue && (
                        <a href={config.quickLinks.reportIssue} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            {t("reportIssue")}
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center border-t border-border dark:border-border-dark pt-4">
                    <Button variant="ghost" onClick={handleClose}>
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
