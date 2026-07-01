"use client";

import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function LicensePage() {
  const t = useTranslations("license");

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />
      <Section>
        <Card glass={false} className="prose prose-sm dark:prose-invert max-w-3xl mx-auto">
          <h2>GNU General Public License v3.0</h2>
          <p>Lingmo OS is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.</p>

          <h2>Permissions</h2>
          <ul>
            <li>Commercial use: You may use Lingmo OS for commercial purposes.</li>
            <li>Modification: You may modify the source code.</li>
            <li>Distribution: You may distribute the software.</li>
            <li>Patent use: This license provides an express grant of patent rights from contributors.</li>
            <li>Private use: You may use the software privately.</li>
          </ul>

          <h2>Conditions</h2>
          <ul>
            <li>Disclose source: You must disclose your source code when you distribute the software.</li>
            <li>License and copyright notice: You must include a copy of this license and copyright notice.</li>
            <li>Same license: Modifications must be released under the same GPL v3 license.</li>
            <li>State changes: You must indicate changes made to the original code.</li>
          </ul>

          <h2>Disclaimer</h2>
          <p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.</p>

          <h2>Open Source Components</h2>
          <p>Lingmo OS incorporates components from numerous open-source projects including the Linux kernel, GNU utilities, GTK4, systemd, PulseAudio, and many others, each under their respective licenses.</p>
        </Card>
      </Section>
    </>
  );
}
