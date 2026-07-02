"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
  const t = useTranslations();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        fontFamily: "sans-serif",
        backgroundColor: "#fafafb",
        color: "#09090b",
      }}
    >
      <div>
        <h1 style={{ fontSize: "4rem", margin: 0, color: "#4f7cff" }}>404</h1>
        <p style={{ fontSize: "1.2rem", color: "#73737c", marginTop: "0.5rem" }}>
          {t("notFound") || "Page Not Found"}
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: "1.5rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#4f7cff",
            color: "#fff",
            borderRadius: "0.5rem",
            textDecoration: "none",
          }}
        >
          {t("backToHome") || "Back to Home"}
        </Link>
      </div>
    </div>
  );
}
