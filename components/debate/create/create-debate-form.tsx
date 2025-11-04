"use client";

import { FileText } from "lucide-react";
import { useState } from "react";
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
import { ArgumentsSubmitter } from "../argument/arguments-submitter";
import { BasicInfoSection } from "./basic-info-section";
import { DebateParametersSection } from "./debate-parameters-section";
import { InitialArgumentsSection } from "./initial-arguments-section";
import { SubmitButtons } from "./submit-button";

interface CreateDebateFormProps {
  onSubmit: (
    formData: DebateFormData,
    initialArguments: InitialArgument[],
    status: string,
  ) => void;
  isSubmitting: boolean;
}

export function CreateDebateForm({
  onSubmit,
  isSubmitting,
}: CreateDebateFormProps) {
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFormSubmit = (status: string) => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = "Title is required";
    if (formData.topics.length === 0)
      newErrors.topics = "At least one topic is required";

    // Validate initial arguments
    const hasValidArguments = initialArguments.some((arg) => {
      const plainText = arg.content.replace(/<[^>]*>/g, "").trim();
      return plainText && plainText.length >= 10;
    });

    if (!hasValidArguments) {
      newErrors.initialArguments =
        "At least one valid initial argument is required (minimum 10 characters)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData, initialArguments, status);
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
      <CardHeader className="space-y-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8" />
          <div>
            <CardTitle className="text-3xl">Create New Debate</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Set up your debate parameters and initial arguments
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        <BasicInfoSection
          formData={formData}
          errors={errors}
          onUpdate={updateFormData}
          onClearError={clearError}
        />

        <ArgumentsSubmitter
          initialArguments={initialArguments}
          error={errors.initialArguments}
          onArgumentsChange={setInitialArguments}
          mode="create"
          title="Initial Arguments"
          description="Add one or more initial arguments to start the debate"
          minArguments={1}
          maxArguments={5}
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
