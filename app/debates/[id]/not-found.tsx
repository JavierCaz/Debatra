"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <h1 className="text-3xl font-bold mb-2">{t("debateDetail.notFound")}</h1>
      <p className="text-muted-foreground mb-6">
        {t("debateDetail.notFoundDesc")}
      </p>
      <Link href="/debates">
        <Button>{t("debateDetail.backToDebates")}</Button>
      </Link>
    </div>
  );
}
