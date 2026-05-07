"use client";

import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

interface OpeningStatementSectionProps {
  openingStatement: string;
  error?: string;
  onUpdate: (content: string) => void;
}

export function OpeningStatementSection({
  openingStatement,
  error,
  onUpdate,
}: OpeningStatementSectionProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {t("debate.create.openingStatement")}
        </h3>
      </div>

      <div className="space-y-2">
        <Label>
          {t("debate.create.yourPosition")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <TiptapEditor
          content={openingStatement}
          onChange={onUpdate}
          placeholder={t("debate.create.openingPlaceholder")}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          {t("debate.create.openingHelp")}
        </p>
      </div>
    </div>
  );
}
