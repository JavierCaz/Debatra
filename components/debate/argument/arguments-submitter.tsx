"use client";

import { Lock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import type { InitialArgument, Reference } from "@/types/debate";
import { ReferencesSection } from "./reference-section";

interface ArgumentsSectionProps {
  initialArguments: InitialArgument[];
  error?: string;
  onArgumentsChange: (args: InitialArgument[]) => void;
  mode?: "create" | "respond";
  disabled?: boolean;
  disabledMessage?: string;
  maxArguments?: number;
  minArguments?: number;
  title?: string;
  description?: string;
  showStatusIndicators?: boolean;
}

export function ArgumentsSubmitter({
  initialArguments,
  error,
  onArgumentsChange,
  mode = "create",
  disabled = false,
  disabledMessage = "Argument submission is not available at this time",
  maxArguments = 5,
  minArguments = 1,
  title = "Arguments",
  description = "Add your arguments with supporting evidence",
  showStatusIndicators = true,
}: ArgumentsSectionProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(
    initialArguments.map((arg) => arg.id.toString()),
  );

  const addArgument = () => {
    if (initialArguments.length >= maxArguments) return;

    const newArgument: InitialArgument = {
      id: Date.now(),
      content: "",
      references: [],
    };
    onArgumentsChange([...initialArguments, newArgument]);
    // Auto-expand new arguments
    setExpandedItems((prev) => [...prev, newArgument.id.toString()]);
  };

  const removeArgument = (id: number) => {
    if (initialArguments.length > minArguments) {
      onArgumentsChange(initialArguments.filter((arg) => arg.id !== id));
      setExpandedItems((prev) =>
        prev.filter((itemId) => itemId !== id.toString()),
      );
    }
  };

  const updateArgument = (id: number, updates: Partial<InitialArgument>) => {
    onArgumentsChange(
      initialArguments.map((arg) =>
        arg.id === id ? { ...arg, ...updates } : arg,
      ),
    );
  };

  const updateArgumentReferences = (id: number, references: Reference[]) => {
    updateArgument(id, { references });
  };

  // Get character count for preview (strip HTML tags)
  const getPreviewText = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, "").trim();
    return plainText.length > 100
      ? plainText.substring(0, 100) + "..."
      : plainText || "No content yet";
  };

  // Check if argument has content
  const hasContent = (argument: InitialArgument) => {
    const plainText = argument.content.replace(/<[^>]*>/g, "").trim();
    return plainText.length > 0;
  };

  // Check if argument has references
  const hasReferences = (argument: InitialArgument) => {
    return argument.references.length > 0;
  };

  // Expand/Collapse All functions
  const expandAll = () => {
    setExpandedItems(initialArguments.map((arg) => arg.id.toString()));
  };

  const collapseAll = () => {
    setExpandedItems([]);
  };

  // Determine if we can add more arguments
  const canAddArgument = initialArguments.length < maxArguments && !disabled;

  // If disabled, show a message instead of the full component
  if (disabled) {
    return (
      <Card className="border-dashed bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Lock className="h-8 w-8 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {disabledMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {canAddArgument && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addArgument}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Argument
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Expand/Collapse All Buttons */}
      {initialArguments.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {initialArguments.length} argument
            {initialArguments.length !== 1 ? "s" : ""}
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={expandAll}
              disabled={expandedItems.length === initialArguments.length}
            >
              Expand All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={collapseAll}
              disabled={expandedItems.length === 0}
            >
              Collapse All
            </Button>
          </div>
        </div>
      )}

      <Accordion
        type="multiple"
        value={expandedItems}
        onValueChange={setExpandedItems}
        className="space-y-4"
      >
        {initialArguments.map((argument, index) => {
          const hasArgumentContent = hasContent(argument);
          const hasArgumentReferences = hasReferences(argument);
          const isExpanded = expandedItems.includes(argument.id.toString());

          return (
            <AccordionItem
              key={argument.id}
              value={argument.id.toString()}
              className="border border-border rounded-lg bg-background"
            >
              <div className="relative">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                  <div className="flex items-center justify-between w-full pr-8">
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-base font-semibold">
                        {mode === "create"
                          ? `Argument ${index + 1}`
                          : `Your Argument ${index + 1}`}
                      </span>

                      {/* Status indicators */}
                      {showStatusIndicators && (
                        <div className="flex items-center space-x-1">
                          {hasArgumentContent && (
                            <div
                              className="w-2 h-2 rounded-full bg-green-500"
                              title="Has content"
                            />
                          )}
                          {hasArgumentReferences && (
                            <div
                              className="w-2 h-2 rounded-full bg-blue-500"
                              title="Has references"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>

                {/* Delete button - positioned absolutely to avoid accordion trigger conflicts */}
                {initialArguments.length > minArguments && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeArgument(argument.id);
                    }}
                    className="absolute right-12 top-4 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Preview when collapsed */}
              {!isExpanded && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-muted-foreground">
                    {getPreviewText(argument.content)}
                  </p>
                  {hasArgumentReferences && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {argument.references.length} reference(s)
                    </p>
                  )}
                </div>
              )}

              <AccordionContent className="px-0">
                <div className="px-6 pb-6 space-y-6 border-t pt-4">
                  <div className="space-y-2">
                    <Label>
                      Argument Content{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <TiptapEditor
                      content={argument.content}
                      onChange={(content) =>
                        updateArgument(argument.id, { content })
                      }
                      placeholder="Present your argument, evidence, and reasoning..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide a well-reasoned argument with supporting evidence
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <ReferencesSection
                      references={argument.references}
                      onReferencesChange={(references: Reference[]) =>
                        updateArgumentReferences(argument.id, references)
                      }
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
