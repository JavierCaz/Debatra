"use client";

import { FileText } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DebateFormat,
  type DebateFormData,
  type InitialArgument,
} from "@/types/debate";
import type { InitialDefinition } from "@/types/definitions";
import { DebateSubmissionForm } from "../submission/debate-submission-form";
import { BasicInfoSection } from "./basic-info-section";
import { DebateParametersSection } from "./debate-parameters-section";
import { SubmitButtons } from "./submit-button";

interface CreateDebateFormProps {
  onSubmit: (
    formData: DebateFormData,
    initialArguments: InitialArgument[],
    initialDefinitions: InitialDefinition[],
    status: string,
  ) => void;
  isSubmitting: boolean;
}

export function CreateDebateForm({
  onSubmit,
  isSubmitting,
}: CreateDebateFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<DebateFormData>({
    title: "",
    topics: [],
    description: "",
    format: DebateFormat.ONE_VS_ONE,
    maxParticipants: 2,
    turnsPerSide: 3,
    turnTimeLimit: 24,
    minReferences: 1,
  });

  const [initialArguments, setInitialArguments] = useState<InitialArgument[]>([
    {
      id: Date.now(),
      content: "",
      references: [],
    },
  ]);

  const [initialDefinitions, setInitialDefinitions] = useState<
    InitialDefinition[]
  >([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFormSubmit = (status: string) => {
    const newErrors: Record<string, string> = {};

    // Basic form validation
    if (!formData.title) newErrors.title = t("debate.create.titleRequired");
    if (formData.topics.length === 0)
      newErrors.topics = t("debate.create.topicRequired");

    // Validate initial arguments
    const hasValidArguments = initialArguments.some((arg) => {
      const plainText = arg.content.replace(/<[^>]*>/g, "").trim();
      return plainText && plainText.length >= 10;
    });

    if (!hasValidArguments) {
      newErrors.initialArguments = t("debate.create.argRequired");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData, initialArguments, initialDefinitions, status);
  };

  const updateFormData = (updates: Partial<DebateFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card>
      <CardHeader className="relative overflow-hidden border-b">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {t("debate.create.title")}
            </CardTitle>
            <CardDescription className="text-muted-foreground max-w-md">
              {t("debate.create.description")}
            </CardDescription>
          </div>

          <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
            <FileText className="h-7 w-7 text-primary" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <BasicInfoSection
          formData={formData}
          errors={errors}
          onUpdate={updateFormData}
          onClearError={clearError}
        />

        <DebateSubmissionForm
          arguments={initialArguments}
          onArgumentsChange={setInitialArguments}
          argumentsError={errors.initialArguments}
          definitions={initialDefinitions}
          onDefinitionsChange={setInitialDefinitions}
          definitionsError={errors.definitions}
        />

        <DebateParametersSection
          formData={formData}
          onUpdate={updateFormData}
        />

        <SubmitButtons
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
        />
      </CardContent>
    </Card>
  );
}
