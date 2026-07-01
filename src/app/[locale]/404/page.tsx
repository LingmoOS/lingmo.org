"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export default function NotFoundPage() {
  const t = useTranslations("404");

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-8xl font-bold text-primary/20">404</div>
        <h1 className="mt-4 text-3xl font-bold md:text-4xl">{t("title")}</h1>
        <p className="mt-4 max-w-md text-muted dark:text-muted-dark">{t("description")}</p>
        <div className="mt-8">
          <Link href="/">
            <Button variant="primary" size="lg">
              <Home className="mr-2 h-5 w-5" />
              {t("goHome")}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
