"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArgumentsSubmitter } from "@/components/debate/argument/arguments-submitter";
import { DefinitionsSubmitter } from "@/components/debate/definition/definitions-submitter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InitialArgument } from "@/types/debate";
import type { InitialDefinition } from "@/types/definitions";

interface DebateSubmissionFormProps {
  arguments: InitialArgument[];
  onArgumentsChange: (args: InitialArgument[]) => void;
  argumentsError?: string;

  definitions: InitialDefinition[];
  onDefinitionsChange: (defs: InitialDefinition[]) => void;
  definitionsError?: string;
}

export function DebateSubmissionForm({
  arguments: initialArguments,
  onArgumentsChange,
  argumentsError,
  definitions,
  onDefinitionsChange,
  definitionsError,
}: DebateSubmissionFormProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("arguments");

  const handleTabChange = (value: string) => {
    if (value === "arguments" || value === "definitions") {
      setActiveTab(value);
    }
  };

  const completedArguments = initialArguments.filter((arg) => {
    const plainText = arg.content.replace(/<[^>]*>/g, "").trim();
    return plainText.length > 0;
  }).length;

  const completedDefinitions = definitions.filter((def) => {
    return def.term.trim().length > 0 && def.definition.trim().length > 0;
  }).length;

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="arguments" className="relative">
            {t("debate.submission.arguments")}
            {completedArguments > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-primary-foreground bg-primary rounded-full dark:bg-primary/80">
                {completedArguments}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="definitions" className="relative">
            {t("debate.submission.definitions")}
            {completedDefinitions > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-primary-foreground bg-primary rounded-full dark:bg-primary/80">
                {completedArguments}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arguments" className="mt-6">
          <ArgumentsSubmitter
            initialArguments={initialArguments}
            error={argumentsError}
            onArgumentsChange={onArgumentsChange}
            title={t("debate.submission.openingArgs")}
            description={t("debate.submission.openingArgsDesc")}
          />
        </TabsContent>

        <TabsContent value="definitions" className="mt-6">
          <DefinitionsSubmitter
            definitions={definitions}
            error={definitionsError}
            onDefinitionsChange={onDefinitionsChange}
            title={t("debate.submission.defineTerms")}
            description={t("debate.submission.defineTermsDesc")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
